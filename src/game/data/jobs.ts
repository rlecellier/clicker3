import type { Requirement } from '@game/requirements';

export type Job = {
  id: string;
  name: string;
  // Euros gagnés à chaque action de travail.
  salary: number;
  // Réputation gagnée à chaque action de travail.
  reputation: number;
  // Réputation dépensée pour obtenir l'emploi.
  cost: number;
  requirement?: Requirement;
};

// Les quatre emplois successifs (docs/game/ton-et-univers.md). Valeurs provisoires.
export const jobs: readonly Job[] = [
  {
    id: 'interim',
    name: 'Manutentionnaire intérimaire',
    salary: 40,
    reputation: 0.2,
    cost: 0,
  },
  {
    id: 'polyvalent',
    name: 'Employé polyvalent',
    salary: 70,
    reputation: 0.3,
    cost: 0,
    requirement: { type: 'stat', stat: 'metier', tier: 1 },
  },
  {
    id: 'mission',
    name: 'Chargé de mission',
    salary: 200,
    reputation: 0.5,
    cost: 5,
    requirement: {
      type: 'all',
      of: [
        { type: 'stat', stat: 'metier', tier: 2 },
        { type: 'reputationTier', tier: 1 },
      ],
    },
  },
  {
    id: 'transformation',
    name: 'Directeur adjoint de la transformation',
    salary: 600,
    reputation: 0.8,
    cost: 15,
    requirement: {
      type: 'all',
      of: [
        { type: 'stat', stat: 'metier', tier: 3 },
        { type: 'reputationTier', tier: 2 },
      ],
    },
  },
];
