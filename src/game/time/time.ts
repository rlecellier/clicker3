import type { GameState, LifeSpan } from '@game/state';

export const PERIODS_PER_YEAR = 12;

export type GameDate = { year: number; month: number };

export const ageOf = (state: GameState) =>
  state.life.startAge + Math.floor(state.period / PERIODS_PER_YEAR);

// Date d'une période quelconque de la vie (journal, relevés passés).
export const dateAt = (life: LifeSpan, period: number): GameDate => {
  const months = life.startMonth - 1 + period;
  return {
    year: life.startYear + Math.floor(months / PERIODS_PER_YEAR),
    month: (months % PERIODS_PER_YEAR) + 1,
  };
};

// Date de la période en cours.
export const dateOf = (state: GameState): GameDate =>
  dateAt(state.life, state.period);
