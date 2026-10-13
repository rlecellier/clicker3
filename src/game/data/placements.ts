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

// Une échelle française, du plus sûr au plus risqué ; le surplus de l'argent
// remplit les comptes dans cet ordre (docs/game/placements.md). Rendements par
// mois, ~1,2 % par an pour le Livret A, ~3,6 % pour le PEL, ~10 % pour le
// compte-titres tant qu'aucun événement ne le fait bouger (`stocksRate`).
export const placements: readonly Placement[] = [
  {
    id: 'savings',
    name: 'Livret A',
    description:
      'Sûr, liquide, défiscalisé, et presque aussi excitant que votre compte courant.',
    rate: 0.001,
    requirement: { type: 'reputationTier', tier: 1 },
    ceilingPerReputation: 100,
  },
  {
    id: 'pel',
    name: 'Plan d’épargne logement',
    description:
      'Le placement de ceux qui ont « un projet », et qui l’ont depuis vingt ans.',
    rate: 0.003,
    requirement: { type: 'reputationTier', tier: 2 },
    ceilingPerReputation: 200,
  },
  {
    id: 'stocks',
    name: 'Compte-titres',
    description:
      'Rend plus, bouge avec l’actualité, et se vend « à moyen terme ».',
    rate: 0.008,
    requirement: { type: 'reputationTier', tier: 3 },
    ceilingPerReputation: 300,
  },
];
