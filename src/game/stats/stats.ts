import { statTierThresholds } from '@game/data';
import type { GameState, StatId } from '@game/state';

/** Palier atteint pour une stat : 0 (aucun) à 4 (P4). */
export const tierOf = (state: GameState, stat: StatId) =>
  statTierThresholds[stat].filter((threshold) => state.stats[stat] >= threshold)
    .length;

export type StatProgress = {
  tier: number;
  points: number;
  /** Points gagnés dans le palier en cours (1 au dernier palier). */
  value: number;
  /** Largeur du palier en cours (1 au dernier palier : jauge pleine). */
  max: number;
  isMax: boolean;
};

/** Progression d'une stat vers son prochain palier. */
export const statProgress = (state: GameState, stat: StatId): StatProgress => {
  const tier = tierOf(state, stat);
  const thresholds = statTierThresholds[stat];
  const next = thresholds[tier];
  const points = state.stats[stat];
  if (next === undefined) {
    return { tier, points, value: 1, max: 1, isMax: true };
  }
  const start = tier === 0 ? 0 : (thresholds[tier - 1] ?? 0);
  return {
    tier,
    points,
    value: points - start,
    max: next - start,
    isMax: false,
  };
};
