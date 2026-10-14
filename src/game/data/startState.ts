import { actionRules } from './actionRules';
import { emptyLedger } from '@game/ledger';
import type { GameState } from '@game/state';

/**
 * État de départ d'une vie : Camille Morel, 18 ans, le 1er janvier 1999
 * (docs/game/ton-et-univers.md). Les montants sont des points de départ à
 * équilibrer au simulateur.
 */
export const startState: GameState = {
  version: 20,
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
  gaugeCapacity: 70,
  status: 'playing',
  phase: 'youngAdult',
  lifeSlice: 'youth',
  growth: 0,

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
  isSleeping: false,
  sleepHours: actionRules.sleep.hours.default,
  periodSleepHours: actionRules.sleep.hours.default,
  sleepLeft: 0,
  sleepTotal: 0,
  sleepStepGauge: 0,
  sleepConvertible: 0,
  lastSleepPeriod: -1,
  queuedActions: [],
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
