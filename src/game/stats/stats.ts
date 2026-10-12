import { statTierThresholds } from '@game/data';
import type { GameState, StatId } from '@game/state';

/**
 * Palier atteint : nombre de seuils franchis (0 : aucun). Une seule règle pour
 * les stats et la réputation.
 */
export const tierAt = (thresholds: readonly number[], points: number) =>
  thresholds.filter((threshold) => points >= threshold).length;

export type TierProgress = {
  tier: number;
  /** Points gagnés dans le palier en cours (1 au dernier palier). */
  value: number;
  /** Largeur du palier en cours (1 au dernier palier : jauge pleine). */
  max: number;
  isMax: boolean;
};

/** Progression vers le prochain seuil, pour une barre de palier. */
export const tierProgress = (
  thresholds: readonly number[],
  points: number,
): TierProgress => {
  const tier = tierAt(thresholds, points);
  const next = thresholds[tier];
  if (next === undefined) {
    return { tier, value: 1, max: 1, isMax: true };
  }
  const start = tier === 0 ? 0 : (thresholds[tier - 1] ?? 0);
  return { tier, value: points - start, max: next - start, isMax: false };
};

/** Palier atteint pour une stat : 0 (aucun) à 4 (P4). */
export const tierOf = (state: GameState, stat: StatId) =>
  tierAt(statTierThresholds[stat], state.stats[stat]);

export type StatProgress = TierProgress & { points: number };

/** Progression d'une stat vers son prochain palier. */
export const statProgress = (state: GameState, stat: StatId): StatProgress => ({
  ...tierProgress(statTierThresholds[stat], state.stats[stat]),
  points: state.stats[stat],
});
