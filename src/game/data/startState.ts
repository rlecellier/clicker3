import { emptyLedger } from '@game/ledger';
import type { GameState } from '@game/state';

/**
 * État de départ d'une vie : Camille Morel, 18 ans, le 1er janvier 1999
 * (docs/game/ton-et-univers.md). Les montants sont des points de départ à
 * équilibrer au simulateur.
 */
export const startState: GameState = {
  version: 5,
  characterName: 'Camille Morel',
  life: {
    startAge: 18,
    seniorAge: 60,
    deathAge: 75,
    startYear: 1999,
    startMonth: 1,
  },

  period: 0,
  gauge: 0,
  gaugeCapacity: 70,
  status: 'playing',
  phase: 'youngAdult',

  money: 0,
  stock: 0,
  stockCapacity: 50,
  warehouses: 0,
  reputation: 0,
  reputationEarned: 0,

  stats: { metier: 0, gestion: 0, intelligence: 0, endurance: 0 },
  markers: [],
  maxMarkers: 5,
  isSleeping: false,
  queuedActions: [],
  sleepMultiplier: 1,

  seed: 1999,

  jobId: 'interim',
  housingId: 'studio',
  rent: 300,
  payroll: 0,
  companies: {},
  upgrades: [],
  productionMultiplier: 1,
  salesMultiplier: 1,
  workBoosts: {},
  companyMultipliers: {},
  workReputationMultiplier: 1,
  reputationPerSaleMultiplier: 1,
  lastStatement: null,
  ledger: emptyLedger(),
  districts: ['tilleuls'],

  flags: {},
  events: [],
  firedEvents: [],
  activeEffects: [],
  jobSalaryFactors: {},

  autoWork: false,
  autoElapsed: 0,
  lastSeenAt: null,
};
