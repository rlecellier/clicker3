import { actionRules, jobs, startState } from '@game/data';
import type { GameState } from '@game/state';
import { jobWage, work } from '@game/work';
import {
  isOvertime,
  overtimeGaugeFactor,
  overtimeWageFactor,
  workGaugeDone,
} from './overtime';

const { overtime } = actionRules.work;

const withWork = (amount: number): GameState => ({
  ...startState,
  gauge: amount,
  gaugeSegments: [{ kind: 'work', amount }],
});

const salary = jobs[0]?.salary ?? 0;

describe('workGaugeDone', () => {
  it('ne compte que le travail de la période', () => {
    const mixed: GameState = {
      ...startState,
      gauge: 55,
      gaugeSegments: [
        { kind: 'sleep', amount: 25 },
        { kind: 'work', amount: 20 },
        { kind: 'study', amount: 10 },
      ],
    };
    expect(workGaugeDone(mixed)).toBe(20);
    expect(workGaugeDone(startState)).toBe(0);
  });
});

describe('heures supplémentaires', () => {
  it('paient les 8 h de la journée au salaire de base', () => {
    const state = withWork(overtime.regularGauge - 1);
    expect(isOvertime(state)).toBe(false);
    expect(overtimeWageFactor(state)).toBe(1);
    expect(overtimeGaugeFactor(state)).toBe(1);
    expect(jobWage(state)).toBe(salary);
  });

  it('s’appliquent seules une fois la journée faite, sans déblocage', () => {
    const state = withWork(overtime.regularGauge);
    expect(startState.upgrades).toEqual([]);
    expect(isOvertime(state)).toBe(true);
    expect(overtimeWageFactor(state)).toBe(1.25);
    expect(jobWage(state)).toBe(Math.round(salary * 1.25));
  });

  it('montent à + 50 % à la tranche suivante', () => {
    const state = withWork(50);
    expect(overtimeWageFactor(state)).toBe(1.5);
    expect(jobWage(state)).toBe(Math.round(salary * 1.5));
  });

  it('fatiguent : l’action coûte plus de jauge', () => {
    const base = work(startState);
    const tired = work(withWork(30));
    expect(base.gauge).toBe(actionRules.work.gauge);
    expect(tired.gauge - 30).toBeCloseTo(
      actionRules.work.gauge * (1 + overtime.gaugeSurcharge),
    );
  });

  it('verse exactement ce que jobWage annonce', () => {
    for (const done of [0, 29, 30, 49, 50, 55]) {
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
    const next = work(withWork(60));
    expect(next.period).toBe(1);
    expect(workGaugeDone(next)).toBeLessThan(overtime.regularGauge);
    expect(isOvertime(next)).toBe(false);
  });

  it('ne comptent ni le sommeil ni les études', () => {
    const rested: GameState = {
      ...startState,
      gauge: 40,
      gaugeSegments: [{ kind: 'sleep', amount: 40 }],
    };
    expect(isOvertime(rested)).toBe(false);
  });
});
