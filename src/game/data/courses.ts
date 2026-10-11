import type { Requirement } from '@game/requirements';
import type { StatId } from '@game/state';

export type Course = {
  id: string;
  name: string;
  // Stat dont étudier donne des marqueurs.
  stat: StatId;
  // Euros dépensés à chaque action d'étude.
  cost: number;
  requirement?: Requirement;
};

// Un cursus ouvert au départ ; les autres viennent avec les formations (V1-08).
export const courses: readonly Course[] = [
  { id: 'metier', name: 'Formation sur le tas', stat: 'metier', cost: 20 },
];
