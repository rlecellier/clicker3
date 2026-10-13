import type { Requirement } from '@game/requirements';
import type { PlacementId } from '@game/state';

export type Placement = {
  id: PlacementId;
  name: string;
  description: string;
  // Rendement par période (une période : un mois), versé sur le compte courant.
  rate: number;
  // Débloqué par ce palier de réputation (`requirement`) puis, à chaque palier
  // de plus, par le plafond suivant : plafond de capital placé en euros.
  requirement: Requirement & { type: 'reputationTier' };
  ceilings: readonly number[];
};

// Rendements calés au simulateur (docs/game/placements.md). L'épargne rend
// ~3,6 % par an (livret, 1999), le compte titres ~10 % tant qu'aucun
// événement ne le fait bouger (`stocksRate`).
export const placements: readonly Placement[] = [
  {
    id: 'savings',
    name: 'Compte épargne optimisée',
    description:
      'Sûr, liquide, et presque aussi excitant que votre compte courant.',
    rate: 0.003,
    requirement: { type: 'reputationTier', tier: 1 },
    ceilings: [5000, 20_000, 80_000],
  },
  {
    id: 'stocks',
    name: 'Portefeuille de valeur actionnariale',
    description:
      'Rend plus, bouge avec l’actualité, et se vend « à moyen terme ».',
    rate: 0.008,
    requirement: { type: 'reputationTier', tier: 2 },
    ceilings: [20_000, 150_000],
  },
];
