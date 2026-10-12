import type { StatId } from '@game/state';

/**
 * Points nécessaires pour atteindre les 8 niveaux de chaque stat (progression
 * géométrique, environ × 2 : docs/game/propositions-equilibrage.md axe A).
 * Valeurs calées au simulateur (docs/game/equilibrage.md).
 */
export const statTierThresholds: Record<StatId, readonly number[]> = {
  metier: [2, 6, 15, 35, 80, 170, 350, 700],
  gestion: [2, 6, 15, 35, 80, 170, 350, 700],
  intelligence: [2, 6, 15, 35, 80, 170, 350, 700],
  endurance: [2, 6, 15, 35, 80, 170, 350, 700],
};
