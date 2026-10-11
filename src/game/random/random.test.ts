import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';
import { next, smoothedRoll } from './random';

const draw = (state: GameState, count: number) => {
  const values: number[] = [];
  let current = state;
  for (let index = 0; index < count; index++) {
    const [value, after] = next(current);
    values.push(value);
    current = after;
  }
  return values;
};

describe('next', () => {
  it('donne la même suite pour la même graine', () => {
    expect(draw(startState, 20)).toEqual(draw(startState, 20));
  });

  it('donne des suites différentes pour des graines différentes', () => {
    expect(draw({ ...startState, seed: 1 }, 5)).not.toEqual(
      draw({ ...startState, seed: 2 }, 5),
    );
  });

  it('tire des valeurs dans [0, 1[ de moyenne proche de 0,5', () => {
    const values = draw(startState, 5000);
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    expect(mean).toBeCloseTo(0.5, 1);
  });

  it('range la nouvelle graine dans l’état, sans muter l’ancien', () => {
    const frozen = deepFreeze(structuredClone(startState));
    const [, after] = next(frozen);
    expect(after.seed).not.toBe(frozen.seed);
    expect(Number.isSafeInteger(after.seed)).toBe(true);
    expect(frozen.seed).toBe(startState.seed);
  });
});

const rolls = (expected: number, variance: number) => {
  const values: number[] = [];
  let current = startState;
  for (let index = 0; index < 5000; index++) {
    const [value, after] = smoothedRoll(current, expected, variance);
    values.push(value);
    current = after;
  }
  return values;
};

describe('smoothedRoll', () => {
  it('a une moyenne proche de la valeur attendue', () => {
    const values = rolls(10, 0.5);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    expect(mean).toBeGreaterThan(9.9);
    expect(mean).toBeLessThan(10.1);
  });

  it('reste dans la fourchette donnée par la variance', () => {
    const values = rolls(20, 0.2);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(16);
    expect(Math.max(...values)).toBeLessThanOrEqual(24);
  });

  it('sans variance, rend exactement la valeur attendue', () => {
    const [value] = smoothedRoll(startState, 7, 0);
    expect(value).toBe(7);
  });
});
