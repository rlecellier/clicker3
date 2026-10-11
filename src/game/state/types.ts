import type { lifePhases } from './lifePhases';

export type GameStatus = 'playing' | 'dead';

export type StatId = 'metier' | 'gestion' | 'intelligence' | 'endurance';

export type LifePhase = (typeof lifePhases)[number];

// Ligne du journal : un événement survenu, avec son texte final.
export type JournalEntry = {
  period: number;
  id: string;
  text: string;
};

// Effet temporaire d'un événement (ex. bulle internet), jusqu'à une période.
export type ActiveEffect = {
  eventId: string;
  kind: 'sales' | 'workSlow';
  value: number;
  // Période à partir de laquelle l'effet n'agit plus.
  until: number;
};

// Relevé économique d'une période (suivi détaillé : V1-13).
export type PeriodStatement = {
  // Période qui vient de se terminer.
  period: number;
  revenue: number;
  expenses: number;
  stockProduced: number;
  stockSold: number;
  stockLost: number;
  reputationGained: number;
  reputationLost: number;
  unpaid: boolean;
  // Au moins un commerce n'a pas pu tout servir.
  stockout: boolean;
};

// Recettes, dépenses et flux d'une durée (période ou cumul), voir `@game/ledger`.
export type LedgerFigures = {
  // Recettes (euros).
  wages: number;
  sales: number;
  surplus: number;
  otherIncome: number;
  // Dépenses (euros).
  rent: number;
  payroll: number;
  purchases: number;
  studies: number;
  otherExpenses: number;
  // Flux de stock (articles) : stocké, vendu, perdu faute de place.
  stockProduced: number;
  stockSold: number;
  stockLost: number;
  // Flux de réputation.
  reputationGained: number;
  reputationLost: number;
  reputationSpent: number;
};

export type Ledger = {
  // Période en cours, versée dans `last` quand elle se termine.
  current: LedgerFigures;
  last: LedgerFigures;
  total: LedgerFigures;
};

export type LifeSpan = {
  startAge: number;
  // Âge à partir duquel le personnage est senior (les actions manuelles rapportent moins).
  seniorAge: number;
  deathAge: number;
  /** Année du premier jour de la partie. */
  startYear: number;
  /** Mois (1 à 12) du premier jour de la partie. */
  startMonth: number;
};

/**
 * Tout l'état du jeu. Sérialisable (JSON), sans date ni fonction : le temps
 * vient uniquement de `period` et `gauge` (ADR 0002).
 */
export type GameState = {
  version: number;
  characterName: string;
  life: LifeSpan;

  /** Nombre de périodes écoulées depuis le départ. */
  period: number;
  /** Remplissage de la jauge de temps de la période en cours. */
  gauge: number;
  /** Remplissage à partir duquel une période passe. */
  gaugeCapacity: number;
  status: GameStatus;
  phase: LifePhase;

  /** Euros entiers. */
  money: number;
  stock: number;
  // Capacité de l'entrepôt : la production au-delà est perdue.
  stockCapacity: number;
  reputation: number;
  // Total de réputation gagnée depuis le départ : dépenser ne le fait pas baisser.
  reputationEarned: number;

  stats: Record<StatId, number>;
  markers: StatId[];
  // Nombre maximum de marqueurs détenus.
  maxMarkers: number;
  // Conversion du sommeil, selon le logement (studio : 1).
  sleepMultiplier: number;

  /** Graine du générateur aléatoire. */
  seed: number;

  jobId: string | null;
  housingId: string;
  rent: number;
  // Salaires des employés prélevés à chaque période.
  payroll: number;
  /** Nombre d'exemplaires possédés, par type d'entreprise. */
  companies: Record<string, number>;
  upgrades: string[];
  // Multiplicateurs de production et de ventes (alimentés par les améliorations).
  productionMultiplier: number;
  salesMultiplier: number;
  // Actions de travail faites cette période dans chaque entreprise.
  workBoosts: Record<string, number>;
  // Multiplicateur propre à un type d'entreprise (1 si absent).
  companyMultipliers: Record<string, number>;
  // Multiplicateurs de réputation : travail de l'emploi, et par vente.
  workReputationMultiplier: number;
  reputationPerSaleMultiplier: number;
  lastStatement: PeriodStatement | null;
  // Suivi des recettes, dépenses et flux (cumulés et dernière période).
  ledger: Ledger;
  // Quartiers de la ville débloqués.
  districts: string[];

  flags: Record<string, boolean>;
  // Journal des événements (les plus récents, borné).
  events: JournalEntry[];
  // Événements uniques déjà survenus.
  firedEvents: string[];
  activeEffects: ActiveEffect[];
  // Facteur de salaire par emploi (1 si absent).
  jobSalaryFactors: Record<string, number>;

  // Interrupteurs des actions automatiques (activables une fois achetées).
  autoWork: boolean;
  autoSleep: boolean;
  // Temps (ms) accumulé vers la prochaine action automatique.
  autoElapsed: number;
  // Horodatage fourni par l'appelant (jamais lu par les règles). Écrit à la
  // sauvegarde (`serialize`) et au retour (`resume`), qui s'en sert pour rattraper l'absence.
  lastSeenAt: number | null;
};
