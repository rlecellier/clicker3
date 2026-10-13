import type { Requirement } from '@game/requirements';
import type { PlacementId } from '@game/state';

export type Placement = {
  id: PlacementId;
  name: string;
  description: string;
  // Rendement par période (une période : un mois), versé sur le compte courant.
  rate: number;
  // Débloqué par ce palier de réputation ; une fois débloqué, seul le plafond
  // limite le capital.
  requirement: Requirement & { type: 'reputationTier' };
  // Plafond fixe du capital placé, en euros (`Infinity` : aucun plafond).
  ceiling: number;
};

// Trois comptes d'épargne à plafond fixe (ceux de la vraie vie), puis le
// compte-titres, plus rémunérateur et sans plafond : le capital y devient
// exponentiel (docs/game/placements.md). Rendements par mois : ~1,2 % par an
// pour le Livret A et le LDDS, ~3 % pour le PEL, ~7,4 % pour le compte-titres
// tant qu'aucun événement ne le fait bouger (`stocksRate`). Le surplus remplit
// les comptes dans cet ordre.
export const placements: readonly Placement[] = [
  {
    id: 'savings',
    name: 'Livret A',
    description:
      'Sûr, liquide, défiscalisé, et presque aussi excitant que votre compte courant.',
    rate: 0.001,
    requirement: { type: 'reputationTier', tier: 1 },
    ceiling: 22_950,
  },
  {
    id: 'ldds',
    name: 'Livret de développement durable et solidaire',
    description:
      'Le Livret A, en plus vert, et surtout en plus petit : on ne sait jamais ce qu’il développe.',
    rate: 0.001,
    requirement: { type: 'reputationTier', tier: 1 },
    ceiling: 12_000,
  },
  {
    id: 'pel',
    name: 'Plan d’épargne logement',
    description:
      'Le placement de ceux qui ont « un projet », et qui l’ont depuis vingt ans.',
    rate: 0.0025,
    requirement: { type: 'reputationTier', tier: 2 },
    ceiling: 61_200,
  },
  {
    id: 'stocks',
    name: 'Compte-titres',
    description:
      'Rend plus, bouge avec l’actualité, se vend « à moyen terme », et n’a aucun plafond.',
    rate: 0.006,
    requirement: { type: 'reputationTier', tier: 3 },
    ceiling: Infinity,
  },
];
