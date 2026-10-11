import type { GameState } from '@game/state';

/**
 * État de départ d'une vie : Camille Morel, 18 ans, le 1er janvier 1999
 * (docs/game/ton-et-univers.md). Les montants sont des points de départ à
 * équilibrer au simulateur.
 */
export const startState: GameState = {
  version: 1,
  characterName: 'Camille Morel',
  life: { startAge: 18, deathAge: 75, startYear: 1999, startMonth: 1 },

  period: 0,
  gauge: 0,
  gaugeCapacity: 100,
  status: 'playing',
  phase: 'youngAdult',

  money: 0,
  stock: 0,
  reputation: 0,
  reputationEarned: 0,

  stats: { metier: 0, gestion: 0, intelligence: 0, endurance: 0 },
  markers: [],

  seed: 1999,

  jobId: 'interim',
  housingId: 'studio',
  rent: 300,
  companies: {},
  upgrades: [],
  districts: ['tilleuls'],

  flags: {},
  events: [],
};
