import { startState } from '@game/data';
import { ageOf, dateAt, dateOf } from './time';

describe('ageOf', () => {
  it('part de l’âge de départ', () => {
    expect(ageOf(startState)).toBe(18);
  });

  it('gagne un an toutes les 12 périodes', () => {
    expect(ageOf({ ...startState, period: 11 })).toBe(18);
    expect(ageOf({ ...startState, period: 12 })).toBe(19);
    expect(ageOf({ ...startState, period: 684 })).toBe(75);
  });
});

describe('dateOf', () => {
  it('part du 1er janvier 1999', () => {
    expect(dateOf(startState)).toEqual({ year: 1999, month: 1 });
  });

  it('avance d’un mois par période et change d’année', () => {
    expect(dateOf({ ...startState, period: 11 })).toEqual({
      year: 1999,
      month: 12,
    });
    expect(dateOf({ ...startState, period: 12 })).toEqual({
      year: 2000,
      month: 1,
    });
  });

  it('respecte un mois de départ différent', () => {
    const state = {
      ...startState,
      life: { ...startState.life, startMonth: 11 },
      period: 3,
    };
    expect(dateOf(state)).toEqual({ year: 2000, month: 2 });
  });
});

describe('dateAt', () => {
  it('date une période quelconque de la vie', () => {
    expect(dateAt(startState.life, 13)).toEqual({ year: 2000, month: 2 });
    expect(dateAt(startState.life, startState.period)).toEqual(
      dateOf(startState),
    );
  });
});
