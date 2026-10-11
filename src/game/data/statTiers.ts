import type { StatId } from '@game/state';

/**
 * Points nécessaires pour atteindre les paliers P1 à P4 de chaque stat.
 * Valeurs provisoires, à caler au simulateur.
 */
export const statTierThresholds: Record<StatId, readonly number[]> = {
  metier: [10, 30, 70, 150],
  gestion: [10, 30, 70, 150],
  intelligence: [10, 30, 70, 150],
  endurance: [10, 30, 70, 150],
};
