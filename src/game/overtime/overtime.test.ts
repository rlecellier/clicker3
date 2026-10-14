import { actionRules, jobs, startState } from '@game/data';
import type { GameState } from '@game/state';
import { jobWage, work } from '@game/work';
import {
  isOvertime,
  overtimeDurationFactor,
  overtimeWageFactor,
  workMinutesDone,
} from './overtime';

const { overtime } = actionRules.work;

const withWork = (amount: number): GameState => ({
  ...startState,
  gauge: amount,
  gaugeSegments: [{ kind: 'work', amount }],
});

const salary = jobs[0]?.salary ?? 0;

describe('workMinutesDone', () => {
  it('ne compte que le travail de la période', () => {
    const mixed: GameState = {
      ...startState,
      gauge: 530,
      gaugeSegments: [
        { kind: 'work', amount: 200 },
        { kind: 'study', amount: 300 },
        { kind: 'work', amount: 30 },
      ],
    };
    expect(workMinutesDone(mixed)).toBe(230);
    expect(workMinutesDone(startState)).toBe(0);
  });
});

describe('heures supplémentaires', () => {
  it('paient la journée de travail normale au salaire de base', () => {
    const state = withWork(overtime.regularMinutes - 1);
    expect(isOvertime(state)).toBe(false);
    expect(overtimeWageFactor(state)).toBe(1);
    expect(overtimeDurationFactor(state)).toBe(1);
    expect(jobWage(state)).toBe(salary);
  });

  it('s’appliquent seules une fois la journée faite, sans déblocage', () => {
    const state = withWork(overtime.regularMinutes);
    expect(startState.upgrades).toEqual([]);
    expect(isOvertime(state)).toBe(true);
    expect(overtimeWageFactor(state)).toBe(1.25);
    expect(jobWage(state)).toBe(Math.round(salary * 1.25));
  });

  it('montent à la tranche suivante', () => {
    const state = withWork(overtime.tiers[1]?.from ?? 0);
    const rate = overtime.tiers[1]?.wage ?? 1;
    expect(rate).toBeGreaterThan(overtime.tiers[0]?.wage ?? 1);
    expect(overtimeWageFactor(state)).toBe(rate);
    expect(jobWage(state)).toBe(Math.round(salary * rate));
  });

  it('fatiguent : l’action dure plus longtemps', () => {
    const base = work(startState);
    const tired = work(withWork(overtime.regularMinutes));
    expect(base.gauge).toBe(actionRules.work.minutes);
    expect(tired.gauge - overtime.regularMinutes).toBeCloseTo(
      actionRules.work.minutes * (1 + overtime.gaugeSurcharge),
    );
  });

  it('verse exactement ce que jobWage annonce', () => {
    for (const done of [0, 599, 600, 650]) {
      const state = withWork(done);
      const after = work(state);
      const paid = Object.values(after.wagesDue).reduce(
        (sum, amount) => sum + amount,
        0,
      );
      expect(paid).toBe(jobWage(state));
    }
  });

  it('repartent de zéro avec la période suivante', () => {
    const next = work(withWork(startState.gaugeCapacity - 1));
    expect(next.period).toBe(1);
    expect(workMinutesDone(next)).toBeLessThan(overtime.regularMinutes);
    expect(isOvertime(next)).toBe(false);
  });

  it('ne comptent pas les études', () => {
    const studied: GameState = {
      ...startState,
      gauge: 700,
      gaugeSegments: [{ kind: 'study', amount: 700 }],
    };
    expect(isOvertime(studied)).toBe(false);
  });
});
