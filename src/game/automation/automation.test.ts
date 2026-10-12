import { wagesDueOf } from '@game/economy';
import { actionRules, automationRules, jobs, startState } from '@game/data';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';
import { work } from '@game/work';
import {
  autoIntervalMs,
  autoTick,
  canEnableAuto,
  catchUp,
  isAutoActive,
  isTimeRunning,
  resume,
  setAuto,
} from './automation';

const firstJob = jobs[0];

const automated: GameState = {
  ...startState,
  upgrades: ['procedure-travail'],
  autoWork: true,
};

const workOnly = automated;

describe('rythme', () => {
  it('le travail idle simule deux clics par seconde', () => {
    expect(automationRules.speedFactor).toBe(2);
    expect(autoIntervalMs).toBe(500);
  });

  it('ne joue rien avant le délai, puis une action à chaque délai', () => {
    const early = autoTick(workOnly, autoIntervalMs - 1);
    expect(wagesDueOf(early)).toBe(0);
    expect(early.autoElapsed).toBe(autoIntervalMs - 1);
    const later = autoTick(early, 1);
    expect(wagesDueOf(later)).toBeGreaterThan(0);
    expect(later.autoElapsed).toBe(0);
  });

  it('rejoue plusieurs actions dues d’un coup', () => {
    const next = autoTick(workOnly, 3 * autoIntervalMs + 10);
    expect(next.gauge).toBe(3 * actionRules.work.gauge);
    expect(next.autoElapsed).toBe(10);
  });
});

describe('efficacité', () => {
  it('rapporte 2× moins qu’une action manuelle', () => {
    const auto = autoTick(workOnly, autoIntervalMs);
    const manual = work(startState);
    expect(wagesDueOf(auto)).toBe(
      Math.round((firstJob?.salary ?? 0) * automationRules.yieldFactor),
    );
    expect(wagesDueOf(auto)).toBe(wagesDueOf(manual) / 2);
    expect(auto.reputation).toBeCloseTo(manual.reputation / 2);
  });

  it('coûte la même jauge de temps', () => {
    expect(autoTick(workOnly, autoIntervalMs).gauge).toBe(
      actionRules.work.gauge,
    );
  });
});

describe('interrupteurs', () => {
  it('activer demande l’amélioration', () => {
    expect(canEnableAuto(startState, 'work')).toBe(false);
    expect(setAuto(startState, 'work', true)).toBe(startState);
    const owner = { ...startState, upgrades: ['procedure-travail'] };
    expect(canEnableAuto(owner, 'work')).toBe(true);
    expect(setAuto(owner, 'work', true).autoWork).toBe(true);
  });

  it('couper est toujours possible', () => {
    expect(setAuto(automated, 'work', false).autoWork).toBe(false);
  });

  it('un interrupteur sans l’amélioration n’agit pas', () => {
    const forced = { ...startState, autoWork: true };
    expect(isAutoActive(forced, 'work')).toBe(false);
    expect(autoTick(forced, 10 * autoIntervalMs)).toBe(forced);
  });

  it('le temps n’avance pas sans action automatique active', () => {
    const off = { ...automated, autoWork: false };
    expect(autoTick(off, 100 * autoIntervalMs)).toBe(off);
    expect(catchUp(off, 100 * autoIntervalMs).state).toBe(off);
    expect(catchUp(off, 100 * autoIntervalMs).summary.actions).toBe(0);
  });

  it('le temps réel ne compte qu’avec l’auto active ou pendant le sommeil', () => {
    expect(isTimeRunning(startState)).toBe(false);
    expect(isTimeRunning({ ...startState, autoWork: true })).toBe(false);
    expect(isTimeRunning(automated)).toBe(true);
    expect(isTimeRunning({ ...startState, isSleeping: true })).toBe(true);
  });

  it('ne fait rien d’un temps nul ou négatif', () => {
    expect(autoTick(workOnly, 0)).toBe(workOnly);
    expect(autoTick(workOnly, -5)).toBe(workOnly);
  });
});

describe('sommeil', () => {
  const asleep: GameState = {
    ...startState,
    isSleeping: true,
    markers: ['metier', 'metier', 'gestion', 'gestion', 'gestion'],
  };
  const sleepIntervalMs =
    automationRules.sleepDurationMs / startState.maxMarkers;
  const perMarker = actionRules.sleep.gauge / startState.maxMarkers;

  it('vide un marqueur à chaque délai, même sans travail automatique', () => {
    const next = autoTick(asleep, 2 * sleepIntervalMs);
    expect(next.markers).toEqual(['gestion', 'gestion', 'gestion']);
    expect(next.stats.metier).toBe(2);
    expect(next.gauge).toBe(2 * perMarker);
    expect(next.isSleeping).toBe(true);
  });

  it('ne fait rien avant le délai', () => {
    const next = autoTick(asleep, sleepIntervalMs - 1);
    expect(next.markers).toHaveLength(5);
    expect(next.gauge).toBe(0);
  });

  it('dure toujours le même temps, quelle que soit la capacité du cerveau', () => {
    const big: GameState = {
      ...startState,
      maxMarkers: 10,
      isSleeping: true,
      markers: Array.from({ length: 10 }, () => 'metier' as const),
    };
    expect(autoTick(big, automationRules.sleepDurationMs).isSleeping).toBe(
      false,
    );
    expect(autoTick(asleep, automationRules.sleepDurationMs).isSleeping).toBe(
      false,
    );
    expect(autoTick(big, automationRules.sleepDurationMs - 1).isSleeping).toBe(
      true,
    );
  });

  it('rejoue au réveil les gestes manuels gardés', () => {
    const queued: GameState = {
      ...asleep,
      queuedActions: [{ type: 'work', target: 'job' }],
    };
    const next = autoTick(queued, automationRules.sleepDurationMs);
    expect(next.queuedActions).toEqual([]);
    expect(wagesDueOf(next)).toBeGreaterThan(0);
  });

  it('ne garde pas le travail automatique pour le réveil', () => {
    const next = autoTick(
      { ...asleep, upgrades: automated.upgrades, autoWork: true },
      automationRules.sleepDurationMs - 1,
    );
    expect(next.queuedActions).toEqual([]);
    expect(next.money).toBe(0);
  });

  it('se réveille quand le dernier marqueur est vidé', () => {
    const next = autoTick(asleep, 5 * sleepIntervalMs);
    expect(next.markers).toEqual([]);
    expect(next.isSleeping).toBe(false);
    expect(next.gauge).toBe(actionRules.sleep.gauge);
    expect(next.stats.gestion).toBe(3);
  });

  it('le travail automatique attend le réveil', () => {
    const next = autoTick(
      { ...asleep, upgrades: automated.upgrades, autoWork: true },
      5 * sleepIntervalMs,
    );
    expect(wagesDueOf(next)).toBe(0);
    const later = autoTick(next, autoIntervalMs);
    expect(wagesDueOf(later)).toBeGreaterThan(0);
  });
});

describe('catchUp', () => {
  const periodMs =
    (startState.gaugeCapacity / actionRules.work.gauge) * autoIntervalMs;

  it('rejoue l’absence et résume ce qui s’est passé', () => {
    const { state, summary } = catchUp(workOnly, 25 * autoIntervalMs);
    expect(summary.actions).toBe(25);
    expect(summary.periods).toBe(3);
    expect(state.period).toBe(3);
    expect(summary.money).toBe(state.money - workOnly.money);
    expect(summary.stock).toBe(0);
    expect(summary.reputation).toBeCloseTo(state.reputation);
    expect(summary.died).toBe(false);
    expect(summary.ageBefore).toBe(18);
    expect(summary.ageAfter).toBe(18);
    expect(summary.elapsedMs).toBe(25 * autoIntervalMs);
  });

  it('donne le même état qu’une suite de tics', () => {
    const viaCatchUp = catchUp(workOnly, 40 * autoIntervalMs).state;
    let viaTicks = workOnly;
    for (let index = 0; index < 40; index++) {
      viaTicks = autoTick(viaTicks, autoIntervalMs);
    }
    expect(viaCatchUp.money).toBe(viaTicks.money);
    expect(viaCatchUp.period).toBe(viaTicks.period);
    expect(viaCatchUp.seed).toBe(viaTicks.seed);
  });

  it('rapporte les événements survenus, puis le retour après absence', () => {
    const { summary, state } = catchUp(
      { ...workOnly, money: 500_000 },
      12 * periodMs,
    );
    const ids = summary.events.map((entry) => entry.id);
    expect(ids).toContain('loyer');
    expect(ids.at(-1)).toBe('retour-absence');
    expect(state.events.at(-1)?.id).toBe('retour-absence');
  });

  it('s’arrête à la mort', () => {
    const old: GameState = {
      ...workOnly,
      money: 1_000_000,
      period: (startState.life.deathAge - startState.life.startAge) * 12 - 2,
    };
    const { state, summary } = catchUp(old, 1000 * autoIntervalMs);
    expect(state.status).toBe('dead');
    expect(summary.died).toBe(true);
    expect(summary.periods).toBe(2);
    expect(summary.actions).toBeLessThan(1000);
    expect(summary.events.map((entry) => entry.id)).toContain('mort');
    expect(summary.events.map((entry) => entry.id)).not.toContain(
      'retour-absence',
    );
  });

  it('rattrape plusieurs jours d’absence en temps borné', () => {
    const days = 5 * 24 * 3600 * 1000;
    const { state, summary } = catchUp({ ...workOnly, money: 10_000 }, days);
    expect(state.status).toBe('dead');
    expect(summary.died).toBe(true);
  }, 5000);

  it('est sans effet sur un personnage mort', () => {
    const dead = { ...workOnly, status: 'dead' as const };
    expect(catchUp(dead, 1000 * autoIntervalMs).state).toBe(dead);
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(workOnly));
    expect(() => catchUp(frozen, 30 * autoIntervalMs)).not.toThrow();
  });
});

describe('resume', () => {
  const saved: GameState = { ...workOnly, lastSeenAt: 1000 };

  it('rattrape le temps écoulé depuis lastSeenAt puis note le retour', () => {
    const { state, summary } = resume(saved, 1000 + 25 * autoIntervalMs);
    expect(summary.actions).toBe(25);
    expect(state.period).toBe(3);
    expect(state.lastSeenAt).toBe(1000 + 25 * autoIntervalMs);
  });

  it('ne rattrape rien à la première partie', () => {
    const { state, summary } = resume(workOnly, 99_999);
    expect(summary.actions).toBe(0);
    expect(state.period).toBe(0);
    expect(state.lastSeenAt).toBe(99_999);
  });

  it('ignore une horloge revenue en arrière', () => {
    const { state, summary } = resume(saved, 10);
    expect(summary.actions).toBe(0);
    expect(summary.elapsedMs).toBe(0);
    expect(state.lastSeenAt).toBe(10);
  });
});
