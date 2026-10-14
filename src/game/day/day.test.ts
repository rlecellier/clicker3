import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { addGauge } from '@game/period';
import { withModifiers } from '@game/upgrades';
import {
  actionsLeft,
  awakeMinutes,
  baseSleepHours,
  learningFactor,
  sleepHours,
} from './day';

const owning = (...upgrades: string[]) =>
  withModifiers({ ...startState, upgrades });

// Âge à `years` ans, depuis le départ à 18 ans.
const atAge = (age: number): GameState => ({
  ...startState,
  period: (age - startState.life.startAge) * 12,
});

describe('sommeil de base', () => {
  it('change avec la tranche de vie', () => {
    const expected: [number, number][] = [
      [0, 12],
      [5, 12],
      [6, 10],
      [12, 10],
      [13, 9],
      [17, 9],
      [18, 8],
      [29, 8],
      [30, 7],
      [49, 7],
      [50, 7],
      [64, 7],
      [65, 6],
      [90, 6],
    ];
    for (const [age, hours] of expected) {
      expect(baseSleepHours(age), `${age} ans`).toBe(hours);
    }
  });

  it('commence à 8 h et laisse 16 h d’éveil', () => {
    expect(sleepHours(startState)).toBe(8);
    expect(awakeMinutes(startState)).toBe(16 * 60);
    expect(startState.gaugeCapacity).toBe(awakeMinutes(startState));
  });

  it('suit l’âge du personnage', () => {
    expect(sleepHours(atAge(35))).toBe(7);
    expect(awakeMinutes(atAge(70))).toBe(18 * 60);
  });
});

describe('améliorations de sommeil', () => {
  it('« dormir plus » ajoute une heure de sommeil, donc retire de l’éveil', () => {
    const state = owning('matelas-memoire');
    expect(sleepHours(state)).toBe(9);
    expect(state.gaugeCapacity).toBe(15 * 60);
  });

  it('« dormir moins » retire une heure de sommeil, donc ajoute de l’éveil', () => {
    const state = owning('application-sommeil');
    expect(sleepHours(state)).toBe(7);
    expect(state.gaugeCapacity).toBe(17 * 60);
  });

  it('se cumule et reste dans les bornes', () => {
    const state = owning('application-sommeil', 'micro-siestes');
    expect(sleepHours(state)).toBe(6);
    expect(
      sleepHours({ ...startState, sleepLessHours: 20, sleepMoreHours: 0 }),
    ).toBe(4);
    expect(
      sleepHours({ ...startState, sleepMoreHours: 20, sleepLessHours: 0 }),
    ).toBe(12);
  });

  it('calcule le rendement d’apprentissage sur la base de l’âge', () => {
    expect(learningFactor(startState)).toBe(1);
    expect(learningFactor(owning('matelas-memoire'))).toBeCloseTo(9 / 8);
    expect(learningFactor(owning('application-sommeil'))).toBe(1);
    expect(
      learningFactor({ ...atAge(35), sleepMoreHours: 1, sleepLessHours: 0 }),
    ).toBeCloseTo(8 / 7);
  });
});

// Combien d'actions de `minutes` tiennent avant que la période passe.
const clicksPerPeriod = (state: GameState, minutes: number) => {
  let current = state;
  let clicks = 0;
  while (current.period === state.period) {
    current = addGauge(current, minutes, 'work');
    clicks += 1;
  }
  return clicks;
};

describe('le sommeil change le nombre d’actions par période', () => {
  it('8 h d’éveil = 8 actions d’une heure, une heure de moins de sommeil en donne une de plus', () => {
    const eight = { ...startState, gaugeCapacity: 8 * 60 };
    expect(clicksPerPeriod(eight, 60)).toBe(8);
    expect(clicksPerPeriod({ ...eight, gaugeCapacity: 9 * 60 }, 60)).toBe(9);
  });

  it.each([15, 20, 30, 45, 60, 70, 135])(
    'avec des actions de %i minutes : plus d’éveil, plus d’actions',
    (minutes) => {
      const asleep8 = owning();
      const asleep7 = owning('application-sommeil');
      const asleep9 = owning('matelas-memoire');
      expect(clicksPerPeriod(asleep8, minutes)).toBe(
        Math.ceil(asleep8.gaugeCapacity / minutes),
      );
      expect(clicksPerPeriod(asleep7, minutes)).toBeGreaterThanOrEqual(
        clicksPerPeriod(asleep8, minutes),
      );
      expect(clicksPerPeriod(asleep9, minutes)).toBeLessThanOrEqual(
        clicksPerPeriod(asleep8, minutes),
      );
      // 60 minutes d'éveil de plus tiennent toujours au moins une action de plus
      // que le surplus ne l'efface.
      expect(asleep7.gaugeCapacity - asleep8.gaugeCapacity).toBe(60);
    },
  );

  it('compte les actions restantes avant la nuit, celle qui déborde comprise', () => {
    expect(actionsLeft(startState, 200)).toBe(5);
    expect(actionsLeft({ ...startState, gauge: 800 }, 200)).toBe(1);
    expect(actionsLeft({ ...startState, gauge: 801 }, 200)).toBe(1);
    expect(actionsLeft({ ...startState, gauge: 960 }, 200)).toBe(0);
    expect(actionsLeft(owning('application-sommeil'), 60)).toBe(17);
  });
});
