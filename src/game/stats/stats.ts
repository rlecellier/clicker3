import { statTierThresholds } from '@game/data';
import type { GameState, StatId } from '@game/state';

/** Palier atteint pour une stat : 0 (aucun) à 4 (P4). */
export const tierOf = (state: GameState, stat: StatId) =>
  statTierThresholds[stat].filter((threshold) => state.stats[stat] >= threshold)
    .length;
