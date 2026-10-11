import type { GameState } from '@game/state';
import { ageOf } from '@game/time';

export type LifeSummary = {
  age: number;
  companies: number;
  money: number;
  reputation: number;
};

// Bilan de fin de partie, calculé depuis l'état.
export const lifeSummary = (state: GameState): LifeSummary => ({
  age: ageOf(state),
  companies: Object.values(state.companies).reduce(
    (total, count) => total + count,
    0,
  ),
  money: state.money,
  reputation: state.reputation,
});
