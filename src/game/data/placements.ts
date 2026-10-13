import type { Requirement } from '@game/requirements';
import type { PlacementId } from '@game/state';

export type Placement = {
  id: PlacementId;
  name: string;
  description: string;
  // Rendement par période (une période : un mois), versé sur le compte courant.
  rate: number;
  // Débloqué par ce palier de réputation.
  requirement: Requirement & { type: 'reputationTier' };
  // Plafond de capital placé : euros par point de réputation gagné. La
  // réputation suit l'économie (les recettes valent 10 à 20 fois la réputation
  // gagnée sur toute la vie, simulateur), donc le plafond suit la richesse.
  ceilingPerReputation: number;
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
    ceilingPerReputation: 100,
  },
  {
    id: 'stocks',
    name: 'Portefeuille de valeur actionnariale',
    description:
      'Rend plus, bouge avec l’actualité, et se vend « à moyen terme ».',
    rate: 0.008,
    requirement: { type: 'reputationTier', tier: 2 },
    ceilingPerReputation: 300,
  },
];
