import { impactOf } from '@game/impact';
import type { ImpactReport } from '@game/impact';
import type { GameState } from '@game/state';
import { ageOf } from '@game/time';

// Les chiffres simples de la vie, peu coûteux : ils servent aussi aux textes
// des événements.
export type LifeFigures = {
  age: number;
  companies: number;
  money: number;
  reputation: number;
};

export type LifeSummary = LifeFigures & {
  // Pollution et inégalités de la ville et de ses quartiers (ADR 0004).
  impact: ImpactReport;
};

export const lifeFigures = (state: GameState): LifeFigures => ({
  age: ageOf(state),
  companies: Object.values(state.companies).reduce(
    (total, count) => total + count,
    0,
  ),
  money: state.money,
  reputation: state.reputation,
});

// Bilan de fin de partie, calculé depuis l'état.
export const lifeSummary = (state: GameState): LifeSummary => ({
  ...lifeFigures(state),
  impact: impactOf(state),
});
