import { ageOf } from '@game/time';
import { districts, statTierThresholds } from '@game/data';
import { isAutoActive, isTimeRunning } from '@game/automation';
import { newGame, reduce } from '@game/reducer';
import { statIds } from '@game/state';
import type { GameState, StatId } from '@game/state';
import { tierOf } from '@game/stats';
import { lastPeriodReport } from '@game/ledger';
import { simulatorConfig } from './config';
import { chooseAction } from './strategy';

export type SimulationPhase = 'youngAdult' | 'entrepreneur' | 'boss' | 'senior';

export type Milestone = {
  id: string;
  label: string;
  age: number;
  minutes: number;
};

export type CurvePoint = {
  period: number;
  age: number;
  minutes: number;
  money: number;
  stock: number;
  reputation: number;
  companies: number;
  upgrades: number;
  // Recettes de la dernière période.
  revenue: number;
};

/** Achat d'une amélioration, avec les points de stat déjà gagnés à ce moment. */
export type UpgradePurchase = {
  id: string;
  minutes: number;
  statPoints: number;
};

export type SimulationOptions = {
  // Améliorations que le joueur virtuel n'achète jamais (test d'utilité).
  excludedUpgrades?: readonly string[];
};

export type DeadZone = { atMinutes: number; minutes: number };

export type SimulationResult = {
  endedBy: 'death' | 'limit' | 'stuck';
  // Temps de jeu actif estimé : actions manuelles × cadence humaine.
  activeMs: number;
  // Temps passé à attendre les automatismes, sans cliquer (ADR 0005).
  waitMs: number;
  // Durée totale de la vie : jeu actif + attente.
  elapsedMs: number;
  manualActions: number;
  // Actions manuelles par genre (travail, étude, achat…), pour lire où passe le temps.
  actionCounts: Record<string, number>;
  // Clics de travail, d'étude ou de vente après le travail automatique (0 : le
  // joueur virtuel a bien lâché la souris).
  clicksAfterAutoWork: number;
  milestones: Milestone[];
  phasesReached: SimulationPhase[];
  // Plus longue durée sans achat ni déblocage, jusqu'à la mort comprise.
  longestGapMs: number;
  longestGapAtMinutes: number;
  // Toutes les zones mortes au-delà de la tolérance, dans l'ordre du temps.
  deadZones: DeadZone[];
  // État au moment où le travail automatique s'active (pour tester l'absence).
  autoWorkState: GameState | null;
  curve: CurvePoint[];
  upgradePurchases: UpgradePurchase[];
  // Minute où chaque stat atteint son dernier palier (absente : jamais).
  statMaxMinutes: Partial<Record<StatId, number>>;
  // Points de stat utiles gagnés pendant toute la vie (plafonnés au dernier palier).
  statPointsTotal: number;
  finalState: GameState;
};

// Points qui comptent : au-delà du dernier palier, un point ne débloque rien.
const statPointsOf = (state: GameState) =>
  statIds.reduce(
    (sum, stat) =>
      sum +
      Math.min(state.stats[stat], statTierThresholds[stat].at(-1) ?? Infinity),
    0,
  );

const totalCompanies = (state: GameState) =>
  Object.values(state.companies).reduce((sum, count) => sum + count, 0);

// Ce qui compte comme un progrès visible : achat, déblocage, palier de stat.
const hasProgressed = (before: GameState, after: GameState) =>
  totalCompanies(after) > totalCompanies(before) ||
  after.upgrades.length > before.upgrades.length ||
  after.districts.length > before.districts.length ||
  after.jobId !== before.jobId ||
  statIds.some((stat) => tierOf(after, stat) > tierOf(before, stat));

// Dans l'ordre de la vie.
const phaseOrder: readonly SimulationPhase[] = [
  'youngAdult',
  'entrepreneur',
  'boss',
  'senior',
];

const phasesOf = (state: GameState): SimulationPhase[] => {
  const reached: SimulationPhase[] = ['youngAdult'];
  if (state.phase === 'entrepreneur' || state.phase === 'boss') {
    reached.push('entrepreneur');
  }
  if (state.phase === 'boss') {
    reached.push('boss');
  }
  if (ageOf(state) >= state.life.seniorAge) {
    reached.push('senior');
  }
  return reached;
};

/**
 * Joue une vie complète avec le joueur virtuel (stratégie gloutonne) et mesure
 * la durée, les jalons, les zones mortes et la courbe. Déterministe : mêmes
 * données, même résultat. La vie démarre de l'état neuf.
 */
export const simulateLife = (
  start: GameState = newGame(),
  options: SimulationOptions = {},
): SimulationResult => {
  const excluded = new Set(options.excludedUpgrades);
  const { humanCadenceMs, maxSteps, waitStepMs } = simulatorConfig;
  let state = start;
  let activeMs = 0;
  let waitMs = 0;
  let manualActions = 0;
  const actionCounts: Record<string, number> = {};
  let clicksAfterAutoWork = 0;
  let lastProgressMs = 0;
  let longestGapMs = 0;
  let longestGapAtMs = 0;
  let autoWorkState: GameState | null = null;
  const deadZones: DeadZone[] = [];
  let endedBy: SimulationResult['endedBy'] = 'limit';
  const milestones: Milestone[] = [];
  const reached = new Set<string>();
  const phases = new Set<SimulationPhase>(['youngAdult']);
  const curve: CurvePoint[] = [];
  const upgradePurchases: UpgradePurchase[] = [];
  const statMaxMinutes: Partial<Record<StatId, number>> = {};

  const elapsedMs = () => activeMs + waitMs;
  const minutes = () => elapsedMs() / 60_000;
  const mark = (id: string, label: string) => {
    if (reached.has(id)) {
      return;
    }

    reached.add(id);
    milestones.push({ id, label, age: ageOf(state), minutes: minutes() });
  };
  const sample = () => {
    curve.push({
      period: state.period,
      age: ageOf(state),
      minutes: minutes(),
      money: state.money,
      stock: state.stock,
      reputation: state.reputation,
      companies: totalCompanies(state),
      upgrades: state.upgrades.length,
      revenue: lastPeriodReport(state).revenue,
    });
  };
  const noteProgress = () => {
    const gap = elapsedMs() - lastProgressMs;
    if (gap > simulatorConfig.maxDeadZoneMs) {
      deadZones.push({
        atMinutes: lastProgressMs / 60_000,
        minutes: gap / 60_000,
      });
    }
    if (gap > longestGapMs) {
      longestGapMs = gap;
      longestGapAtMs = lastProgressMs;
    }
    lastProgressMs = elapsedMs();
  };
  const observe = () => {
    if (totalCompanies(state) > 0) {
      mark('company', 'Première entreprise');
    }
    if (state.phase === 'boss') {
      mark('employee', 'Premier employé');
    }
    if (isAutoActive(state, 'work')) {
      mark('autoWork', 'Travail automatique');
      autoWorkState ??= state;
    }
    for (const district of districts) {
      if (district.id !== 'tilleuls' && state.districts.includes(district.id)) {
        mark(`district-${district.id}`, district.name);
      }
    }
    for (const phase of phasesOf(state)) {
      phases.add(phase);
    }
    for (const stat of statIds) {
      if (
        statMaxMinutes[stat] === undefined &&
        tierOf(state, stat) >= statTierThresholds[stat].length
      ) {
        statMaxMinutes[stat] = minutes();
      }
    }
  };
  const notePurchases = (before: GameState) => {
    // Un coup de pouce acheté (première fois seulement).
    for (const effect of state.activeEffects) {
      if (
        !before.activeEffects.includes(effect) &&
        upgradePurchases.every((entry) => entry.id !== effect.eventId)
      ) {
        upgradePurchases.push({
          id: effect.eventId,
          minutes: minutes(),
          statPoints: statPointsOf(state),
        });
      }
    }
    for (const id of state.upgrades) {
      if (!before.upgrades.includes(id)) {
        upgradePurchases.push({
          id,
          minutes: minutes(),
          statPoints: statPointsOf(state),
        });
      }
    }
  };

  sample();
  for (let step = 0; step < maxSteps; step++) {
    if (state.status === 'dead') {
      endedBy = 'death';
      break;
    }
    const before = state;
    const action = chooseAction(state, excluded);
    const after = action === undefined ? state : reduce(state, action);
    // Rien à faire (ou action sans effet) : le joueur attend les automatismes.
    const isWaiting = after === state;
    const hasAuto = isTimeRunning(state);
    if (isWaiting && !hasAuto) {
      endedBy = 'stuck';
      break;
    }
    const stepMs = isWaiting ? waitStepMs : humanCadenceMs;
    if (isWaiting) {
      waitMs += stepMs;
    } else {
      activeMs += stepMs;
      manualActions += 1;
      const kind = action?.type ?? 'wait';
      actionCounts[kind] = (actionCounts[kind] ?? 0) + 1;
      if (
        reached.has('autoWork') &&
        ['work', 'study', 'sellSurplus'].includes(action?.type ?? '')
      ) {
        clicksAfterAutoWork += 1;
      }
    }
    state = hasAuto
      ? reduce(after, { type: 'autoTick', elapsedMs: stepMs })
      : after;
    notePurchases(before);
    if (hasProgressed(before, state)) {
      noteProgress();
    }
    observe();
    if (state.period > before.period) {
      sample();
    }
  }
  if (state.status === 'dead') {
    endedBy = 'death';
  }
  noteProgress();
  observe();
  return {
    endedBy,
    activeMs,
    waitMs,
    elapsedMs: elapsedMs(),
    manualActions,
    actionCounts,
    clicksAfterAutoWork,
    milestones,
    phasesReached: phaseOrder.filter((phase) => phases.has(phase)),
    longestGapMs,
    longestGapAtMinutes: longestGapAtMs / 60_000,
    deadZones,
    autoWorkState,
    curve,
    upgradePurchases,
    statMaxMinutes,
    statPointsTotal: statPointsOf(state),
    finalState: state,
  };
};
