import type { StatId } from '@game/state';

export type Course = {
  id: string;
  name: string;
  // Stat dont étudier donne des marqueurs.
  stat: StatId;
  // Euros dépensés à chaque action d'étude.
  cost: number;
};

// Un cursus est disponible une fois la formation achetée (voir upgrades).
// Coûts provisoires.
export const courses: readonly Course[] = [
  { id: 'metier', name: 'Posture professionnelle', stat: 'metier', cost: 20 },
  {
    id: 'gestion',
    name: 'Gestion des opportunités',
    stat: 'gestion',
    cost: 150,
  },
  {
    id: 'intelligence',
    name: 'Économie appliquée',
    stat: 'intelligence',
    cost: 190,
  },
  {
    id: 'endurance',
    name: 'Dépassement de soi',
    stat: 'endurance',
    cost: 260,
  },
];
