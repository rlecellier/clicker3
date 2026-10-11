import type { GameState } from '@game/state';

export const PERIODS_PER_YEAR = 12;

export type GameDate = { year: number; month: number };

export const ageOf = (state: GameState) =>
  state.life.startAge + Math.floor(state.period / PERIODS_PER_YEAR);

export const dateOf = (state: GameState): GameDate => {
  const months = state.life.startMonth - 1 + state.period;
  return {
    year: state.life.startYear + Math.floor(months / PERIODS_PER_YEAR),
    month: (months % PERIODS_PER_YEAR) + 1,
  };
};
