import type { lifePhases } from './lifePhases';

export type GameStatus = 'playing' | 'dead';

export type StatId = 'metier' | 'gestion' | 'intelligence' | 'endurance';

export type LifePhase = (typeof lifePhases)[number];

export type GameEvent = {
  /** Période à laquelle l'événement s'est produit. */
  period: number;
  id: string;
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
  reputation: number;

  stats: Record<StatId, number>;
  markers: StatId[];

  /** Graine du générateur aléatoire. */
  seed: number;

  jobId: string | null;
  housingId: string;
  rent: number;
  /** Nombre d'exemplaires possédés, par type d'entreprise. */
  companies: Record<string, number>;
  upgrades: string[];

  flags: Record<string, boolean>;
  events: GameEvent[];
};
