import {
  companies,
  districts,
  events,
  jobs,
  ledgerHistoryLength,
  startState,
  upgrades,
} from '@game/data';
import { emptyFigures } from '@game/ledger';
import { markAllSeen } from '@game/novelty';
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

export const defaultSaveOptions: SaveOptions = {
  currentVersion: startState.version,
  migrations: {
    // Version 2 : le sommeil n'est plus une action (ni son automatisation).
    1: (raw) => {
      const { upgrades, ...kept } = raw;
      delete kept.autoSleep;
      return {
        ...kept,
        upgrades: Array.isArray(upgrades)
          ? upgrades.filter((id) => id !== 'rythme-sommeil')
          : upgrades,
        isSleeping: false,
        queuedActions: [],
      };
    },
    // Version 3 : le ledger détaille le stock par origine et destination.
    2: (raw) => {
      const { ledger } = raw;
      if (!isRecord(ledger)) {
        return raw;
      }
      const withDetail = (figures: unknown) =>
        isRecord(figures) ? { stockIn: {}, stockOut: {}, ...figures } : figures;
      return {
        ...raw,
        ledger: {
          current: withDetail(ledger.current),
          last: withDetail(ledger.last),
          total: withDetail(ledger.total),
        },
      };
    },
    // Version 4 : les petits entrepôts.
    3: (raw) => ({ ...raw, warehouses: 0 }),
    // Version 5 : le ledger compte les intérêts de la dette.
    4: (raw) => {
      const { ledger } = raw;
      if (!isRecord(ledger)) {
        return raw;
      }
      const withInterest = (figures: unknown) =>
        isRecord(figures) ? { interest: 0, ...figures } : figures;
      return {
        ...raw,
        ledger: {
          current: withInterest(ledger.current),
          last: withInterest(ledger.last),
          total: withInterest(ledger.total),
        },
      };
    },
    // Version 6 : les compteurs de courrier. Une partie existante démarre sans
    // message non lu.
    5: (raw) => {
      const received = Array.isArray(raw.events) ? raw.events.length : 0;
      return { ...raw, mailReceived: received, mailRead: received };
    },
    // Version 7 : les nouveautés vues par onglet. Tout ce qui est déjà débloqué
    // est considéré comme vu, pour ne pas allumer tous les badges.
    6: (raw) => {
      const base = { ...raw, seenItems: startState.seenItems };
      try {
        const { seenItems } = markAllSeen(base as unknown as GameState);
        return { ...base, seenItems };
      } catch {
        // Contenu inexploitable : la validation rejettera la sauvegarde.
        return base;
      }
    },
    // Version 8 : le ledger garde un historique de périodes et ventile les
    // montants par source. `last` devient l'unique entrée de `history` (période
    // `period - 1`, aucune au départ). Les ventilations des périodes déjà
    // jouées sont vides : elles ne somment donc pas à leur total. Le stock de
    // départ de la période en cours se déduit de ses flux ; celui des périodes
    // passées est inconnu (0).
    7: (raw) => {
      const { ledger, period, stock } = raw;
      if (!isRecord(ledger)) {
        return raw;
      }
      const withDetail = (figures: unknown) =>
        isRecord(figures)
          ? {
              stockStart: 0,
              stockEnd: 0,
              salesBy: {},
              wagesBy: {},
              purchasesBy: {},
              studiesBy: {},
              ...figures,
            }
          : figures;
      const current = withDetail(ledger.current);
      if (
        isRecord(current) &&
        isFiniteNumber(stock) &&
        isFiniteNumber(current.stockProduced) &&
        isFiniteNumber(current.stockSold) &&
        isFiniteNumber(current.stockLost)
      ) {
        current.stockStart =
          stock - current.stockProduced + current.stockSold + current.stockLost;
      }
      return {
        ...raw,
        ledger: {
          current,
          history:
            isFiniteNumber(period) && period > 0
              ? [{ period: period - 1, figures: withDetail(ledger.last) }]
              : [],
          total: withDetail(ledger.total),
        },
      };
    },
    // Version 9 : les salaires gagnés sont versés à la clôture de la période
    // (`wagesDue`). Les sauvegardes existantes ont déjà tout encaissé.
    8: (raw) => ({ ...raw, wagesDue: {} }),
  },
};

const isRecord = (value: unknown): value is RawState =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const idsOf = (list: readonly { id: string }[]) =>
  new Set(list.map((item) => item.id));

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

const isActiveEffect = (value: unknown) =>
  isRecord(value) &&
  typeof value.eventId === 'string' &&
  (value.kind === 'sales' || value.kind === 'workSlow') &&
  isFiniteNumber(value.value) &&
  isFiniteNumber(value.until);

const isQueue = (value: unknown) =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isRecord(item) &&
      ((item.type === 'work' && typeof item.target === 'string') ||
        (item.type === 'study' && typeof item.courseId === 'string')),
  );

// Contenu des champs « vides » du modèle (objets, tableaux) : types des
// éléments et ids contre les données du jeu.
const hasValidContent = (raw: RawState) =>
  isNumberRecord(raw.companies, companyIds) &&
  isNumberRecord(raw.workBoosts, companyIds) &&
  isNumberRecord(raw.wagesDue, jobIds) &&
  isNumberRecord(raw.companyMultipliers, companyIds) &&
  isNumberRecord(raw.jobSalaryFactors, jobIds) &&
  isQueue(raw.queuedActions) &&
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
};

const isValidState = (raw: RawState): raw is GameState => {
  if (!hasShapeOf(shapeTemplate, raw)) {
    return false;
  }
  const { status, phase, markers, jobId, lastStatement, lastSeenAt } = raw;
  return (
    (jobId === null || isStringIn(jobId, jobIds)) &&
    (lastStatement === null || isRecord(lastStatement)) &&
    (lastSeenAt === null || isFiniteNumber(lastSeenAt)) &&
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
