import {
  birthSituations,
  childEvents,
  childObjects,
  childTraits,
  companies,
  districts,
  events,
  jobs,
  ledgerHistoryLength,
  startState,
  upgrades,
} from '@game/data';
import { emptyFigures } from '@game/ledger';
import { lifePhases, statIds } from '@game/state';
import type { GameState } from '@game/state';

export type SaveFailure =
  'invalid-json' | 'invalid-format' | 'unknown-version' | 'invalid-state';

export type LoadResult =
  { ok: true; state: GameState } | { ok: false; reason: SaveFailure };

type RawState = Record<string, unknown>;

// Passe l'état brut de la version N à la version N + 1.
export type Migration = (raw: RawState) => RawState;

export type SaveOptions = {
  currentVersion: number;
  // Clé N : migration de la version N vers N + 1.
  migrations: Readonly<Record<number, Migration>>;
};

const isRecord = (value: unknown): value is RawState =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

// Pas de rétrocompatibilité des sauvegardes (ADR 0010) : une version qui
// change l'état monte `startState.version` sans migration, et les parties des
// versions précédentes sont refusées (`unknown-version`).
export const defaultSaveOptions: SaveOptions = {
  currentVersion: startState.version,
  migrations: {},
};

/**
 * Texte de sauvegarde : `{ version, state }`. `now` (horodatage fourni par
 * l'appelant) devient `lastSeenAt`, base du rattrapage d'absence.
 */
export const serialize = (state: GameState, now: number): string =>
  JSON.stringify({
    version: state.version,
    state: { ...state, lastSeenAt: now },
  });

// Compare la forme d'une valeur à celle de l'état de départ (même clés, mêmes
// types). Un modèle `null` accepte `null` ou une valeur JSON ; un tableau ou un
// objet vide accepte n'importe quel contenu.
const hasShapeOf = (template: unknown, value: unknown): boolean => {
  if (template === null) {
    return value !== undefined;
  }
  if (Array.isArray(template)) {
    return Array.isArray(value);
  }
  if (isRecord(template)) {
    if (!isRecord(value)) {
      return false;
    }
    const keys = Object.keys(template);
    return keys.every((key) => hasShapeOf(template[key], value[key]));
  }
  return typeof template === 'number'
    ? typeof value === 'number' && Number.isFinite(value)
    : typeof value === typeof template;
};

const isStringIn = (value: unknown, ids: ReadonlySet<string>) =>
  typeof value === 'string' && ids.has(value);

const idsOf = (list: readonly { id: string }[]) =>
  new Set(list.map((item) => item.id));

const birthSituationIds = idsOf(birthSituations);
const childEventIds = idsOf(childEvents);
const childObjectIds = idsOf(childObjects);
const childTraitIds = idsOf(childTraits);
const companyIds = idsOf(companies);
const districtIds = idsOf(districts);
const eventIds = idsOf(events);
const jobIds = idsOf(jobs);
const upgradeIds = idsOf(upgrades);

// Objet dont les clés sont des ids connus et les valeurs des nombres finis.
const isNumberRecord = (value: unknown, ids: ReadonlySet<string>) =>
  isRecord(value) &&
  Object.entries(value).every(
    ([id, amount]) => ids.has(id) && isFiniteNumber(amount),
  );

const isIdList = (value: unknown, ids: ReadonlySet<string>) =>
  Array.isArray(value) && value.every((id) => isStringIn(id, ids));

const isJournalEntry = (value: unknown) =>
  isRecord(value) &&
  isFiniteNumber(value.period) &&
  typeof value.id === 'string' &&
  typeof value.text === 'string';

const isLedgerPeriod = (value: unknown) =>
  isRecord(value) &&
  isFiniteNumber(value.period) &&
  hasShapeOf(emptyFigures(), value.figures);

const activeEffectKinds = new Set([
  'sales',
  'workSlow',
  'markerChance',
  'studyMarkers',
  'sleepBoost',
  'stocksRate',
]);

const isActiveEffect = (value: unknown) =>
  isRecord(value) &&
  typeof value.eventId === 'string' &&
  activeEffectKinds.has(value.kind as string) &&
  isFiniteNumber(value.value) &&
  isFiniteNumber(value.until);

// Contenu des champs « vides » du modèle (objets, tableaux) : types des
// éléments et ids contre les données du jeu.
const hasValidContent = (raw: RawState) =>
  isNumberRecord(raw.companies, companyIds) &&
  isNumberRecord(raw.workBoosts, companyIds) &&
  isNumberRecord(raw.wagesDue, jobIds) &&
  isNumberRecord(raw.companyMultipliers, companyIds) &&
  isNumberRecord(raw.jobSalaryFactors, jobIds) &&
  isNumberRecord(raw.overtimeActions, jobIds) &&
  isNumberRecord(raw.promotionsOffered, jobIds) &&
  isRecord(raw.flags) &&
  Object.values(raw.flags).every((flag) => typeof flag === 'boolean') &&
  isIdList(raw.upgrades, upgradeIds) &&
  isIdList(raw.districts, districtIds) &&
  isIdList(raw.firedEvents, eventIds) &&
  isRecord(raw.seenItems) &&
  Object.values(raw.seenItems).every(
    (ids) => Array.isArray(ids) && ids.every((id) => typeof id === 'string'),
  ) &&
  isRecord(raw.ledger) &&
  Array.isArray(raw.ledger.history) &&
  raw.ledger.history.length <= ledgerHistoryLength &&
  raw.ledger.history.every((entry) => isLedgerPeriod(entry)) &&
  Array.isArray(raw.events) &&
  raw.events.every((entry) => isJournalEntry(entry)) &&
  Array.isArray(raw.activeEffects) &&
  raw.activeEffects.every((effect) => isActiveEffect(effect));

// Champs qui valent `null` ou une valeur : vérifiés à part.
const shapeTemplate = {
  ...startState,
  jobId: null,
  lastStatement: null,
  lastSeenAt: null,
  pendingPromotion: null,
  pendingBirthday: null,
};

const isPendingPromotion = (value: unknown) =>
  value === null ||
  (isRecord(value) &&
    isStringIn(value.jobId, jobIds) &&
    isFiniteNumber(value.rank));

const isPendingBirthday = (value: unknown) =>
  value === null ||
  (isRecord(value) &&
    isFiniteNumber(value.age) &&
    (value.recap === null ||
      hasShapeOf(
        { months: 0, money: 0, companies: 0, upgrades: 0, reputation: 0 },
        value.recap,
      )));

const isRelation = (value: unknown) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.role === 'string' &&
  (value.kind === 'family' || value.kind === 'friend') &&
  isFiniteNumber(value.bond);

// Ce que l'enfant possède, a vécu et attend : ids connus, nombres finis.
const isValidChild = (raw: RawState) => {
  const { child } = raw;
  return (
    isRecord(child) &&
    isIdList(child.objects, childObjectIds) &&
    isIdList(child.firedEvents, childEventIds) &&
    isIdList(child.traits, childTraitIds) &&
    (child.pendingEvent === null ||
      isStringIn(child.pendingEvent, childEventIds)) &&
    Array.isArray(child.later) &&
    child.later.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.id === 'string' &&
        isFiniteNumber(entry.at),
    )
  );
};

const isValidState = (raw: RawState): raw is GameState => {
  if (!hasShapeOf(shapeTemplate, raw)) {
    return false;
  }
  const {
    status,
    phase,
    markers,
    jobId,
    lastStatement,
    lastSeenAt,
    pendingPromotion,
    pendingBirthday,
  } = raw;
  return (
    (jobId === null || isStringIn(jobId, jobIds)) &&
    (lastStatement === null || isRecord(lastStatement)) &&
    (lastSeenAt === null || isFiniteNumber(lastSeenAt)) &&
    isStringIn(raw.birthSituation, birthSituationIds) &&
    isValidChild(raw) &&
    Array.isArray(raw.relations) &&
    raw.relations.every((relation) => isRelation(relation)) &&
    isPendingPromotion(pendingPromotion) &&
    isPendingBirthday(pendingBirthday) &&
    (status === 'playing' || status === 'dead') &&
    lifePhases.includes(phase as GameState['phase']) &&
    Array.isArray(markers) &&
    markers.every(
      (marker) =>
        typeof marker === 'string' &&
        (statIds as readonly string[]).includes(marker),
    ) &&
    hasValidContent(raw)
  );
};

const migrate = (
  raw: RawState,
  from: number,
  options: SaveOptions,
): RawState | undefined => {
  let current = raw;
  for (let version = from; version < options.currentVersion; version++) {
    const migration = options.migrations[version];
    if (migration === undefined) {
      return undefined;
    }
    current = migration(current);
  }
  return { ...current, version: options.currentVersion };
};

/**
 * Relit une sauvegarde sans jamais planter : JSON corrompu, version inconnue
 * (plus récente, ou sans migration) ou forme incorrecte donnent un échec typé.
 */
export const deserialize = (
  text: string,
  options: SaveOptions = defaultSaveOptions,
): LoadResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }
  if (
    !isRecord(parsed) ||
    typeof parsed.version !== 'number' ||
    !isRecord(parsed.state)
  ) {
    return { ok: false, reason: 'invalid-format' };
  }
  const { version } = parsed;
  if (
    !Number.isSafeInteger(version) ||
    version < 1 ||
    version > options.currentVersion
  ) {
    return { ok: false, reason: 'unknown-version' };
  }
  const migrated = migrate(parsed.state, version, options);
  if (migrated === undefined) {
    return { ok: false, reason: 'unknown-version' };
  }
  return isValidState(migrated)
    ? { ok: true, state: migrated }
    : { ok: false, reason: 'invalid-state' };
};
