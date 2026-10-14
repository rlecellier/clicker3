import { defaultBirthSituationId } from './birthSituations';
import { emptyLedger } from '@game/ledger';
import type { GameState } from '@game/state';

/**
 * État de départ d'une vie : Camille Morel, 18 ans, le 1er janvier 1999
 * (docs/game/ton-et-univers.md). Les montants sont des points de départ à
 * équilibrer au simulateur.
 */
export const startState: GameState = {
  version: 25,
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
  gaugeSegments: [],
  gaugeCapacity: 960,
  status: 'playing',
  phase: 'youngAdult',
  lifeSlice: 'youth',
  growth: 0,
  birthSituation: defaultBirthSituationId,
  relations: [],
  carry: null,
  child: {
    axes: { energy: 0, sociability: 0, mind: 0, bond: 0 },
    objects: [],
    quarter: 0,
    fill: 0,
    seed: 1,
    firedEvents: [],
    lastEventQuarter: -10,
    pendingEvent: null,
    traits: [],
    search: { home: 0, outside: 0 },
    attention: 50,
    later: [],
  },

  money: 0,
  placements: { savings: 0, ldds: 0, pel: 0, stocks: 0 },
  openedPlacements: [],
  stock: 0,
  stockCapacity: 50,
  warehouses: 0,
  reputation: 0,
  reputationEarned: 0,

  stats: { metier: 0, gestion: 0, intelligence: 0, endurance: 0 },
  markers: [],
  markerProgress: { metier: 0, gestion: 0, intelligence: 0, endurance: 0 },
  maxMarkers: 5,
  sleepMoreHours: 0,
  sleepLessHours: 0,
  lastNightMarkers: 0,
  sleepMultiplier: 1,

  jobId: 'interim',
  housingId: 'studio',
  rent: 300,
  payroll: 0,
  rentFactor: 1,
  payrollFactor: 1,
  companies: {},
  upgrades: [],
  productionMultiplier: 1,
  salesMultiplier: 1,
  workBoosts: {},
  wagesDue: {},
  companyMultipliers: {},
  workReputationMultiplier: 1,
  reputationPerSaleMultiplier: 1,
  lastStatement: null,
  ledger: emptyLedger(),
  districts: ['tilleuls'],

  flags: {},
  events: [],
  mailReceived: 0,
  mailRead: 0,
  seenItems: { profile: [], jobs: [], companies: [], upgrades: [], city: [] },
  firedEvents: [],
  activeEffects: [],
  jobSalaryFactors: {},
  overtimeActions: {},
  promotionsOffered: {},
  pendingPromotion: null,
  birthdayBase: {
    age: 18,
    period: 0,
    money: 0,
    companies: 0,
    upgrades: 0,
    reputationEarned: 0,
  },
  // Les 18 ans du départ sont fêtés par `newGame`, pas ici.
  pendingBirthday: null,

  autoWork: false,
  autoElapsed: 0,
  lastSeenAt: null,
};
