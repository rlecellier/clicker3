import type { lifePhases } from './lifePhases';

export type GameStatus = 'playing' | 'dead';

export type StatId = 'metier' | 'gestion' | 'intelligence' | 'endurance';

export type LifePhase = (typeof lifePhases)[number];

export type GameEvent = {
  /** Période à laquelle l'événement s'est produit. */
  period: number;
  id: string;
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
};

export type LifeSpan = {
  startAge: number;
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
  // Quartiers de la ville débloqués.
  districts: string[];

  flags: Record<string, boolean>;
  events: GameEvent[];
};
