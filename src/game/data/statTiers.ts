import type { StatId } from '@game/state';

/**
 * Points nécessaires pour atteindre les paliers P1 à P4 de chaque stat.
 * Valeurs provisoires, à caler au simulateur.
 */
export const statTierThresholds: Record<StatId, readonly number[]> = {
  metier: [2, 9, 41, 81],
  gestion: [2, 9, 41, 81],
  intelligence: [2, 9, 41, 81],
  endurance: [2, 9, 41, 81],
};
