import type { lifePhases } from './lifePhases';
import type { statIds } from './stats';

export type GameStatus = 'playing' | 'dead';

export type StatId = (typeof statIds)[number];

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
  kind:
    | 'sales'
    | 'workSlow'
    // Coups de pouce achetés : chance de marqueur (+ part), marqueurs
    // d'étude en plus, sommeil converti en plus (+ facteur).
    | 'markerChance'
    | 'studyMarkers'
    | 'sleepBoost';
  value: number;
  // Période à partir de laquelle l'effet n'agit plus.
  until: number;
};

// Promotion proposée : l'emploi et son rang (0 à 2, la première est le rang 0).
export type PendingPromotion = { jobId: string; rank: number };

// Drapeaux de la dernière période résolue, lus par les conditions
// (`statement`). Les montants et les flux sont dans le `Ledger`.
export type PeriodStatement = {
  // Période qui vient de se terminer.
  period: number;
  // Du loyer ou des salaires ont été prélevés.
  paidExpenses: boolean;
  // Loyer ou salaires impayés.
  unpaid: boolean;
  // Au moins un commerce n'a pas pu tout servir.
  stockout: boolean;
  // De la production a été perdue faute de place dans l'entrepôt.
  stockFull: boolean;
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
  // Train de vie : courses, transport, téléphone (monte avec le logement).
  living: number;
  // Mensualités des crédits des entreprises (prix affiché = apport).
  charges: number;
  payroll: number;
  purchases: number;
  studies: number;
  otherExpenses: number;
  // Intérêts d'un solde négatif.
  interest: number;
  // Flux de stock (articles) : stocké, vendu, perdu faute de place.
  stockProduced: number;
  stockSold: number;
  stockLost: number;
  // Détail du stock : entrées par entreprise de production (id), sorties par
  // commerce (id) ou `surplus` (vente du surplus).
  stockIn: Record<string, number>;
  stockOut: Record<string, number>;
  // Niveau du stock en entrepôt au début et à la fin de la période (la fin est
  // relevée après les ventes et la perte). Sans sens pour la période en cours
  // (fin) et pour le cumul (début et fin).
  stockStart: number;
  stockEnd: number;
  // Ventilation des euros par source, additionnée comme `stockIn` : leur somme
  // vaut le total correspondant (sauf pour les périodes migrées d'avant la
  // version 8, qui n'ont pas de ventilation).
  // Ventes par commerce (id).
  salesBy: Record<string, number>;
  // Salaires par emploi (id du poste).
  wagesBy: Record<string, number>;
  // Achats par entreprise (id), amélioration (id) ou `warehouse`.
  purchasesBy: Record<string, number>;
  // Études par cursus (id).
  studiesBy: Record<string, number>;
  // Flux de réputation.
  reputationGained: number;
  reputationLost: number;
  reputationSpent: number;
};

// Une période terminée, avec son numéro.
export type LedgerPeriod = {
  period: number;
  figures: LedgerFigures;
};

export type Ledger = {
  // Période en cours, versée dans `history` quand elle se termine.
  current: LedgerFigures;
  // Les dernières périodes terminées, la plus récente en tête (bornée par
  // `ledgerHistoryLength`).
  history: LedgerPeriod[];
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
export type QueuedAction =
  { type: 'work'; target: string } | { type: 'study'; courseId: string };

/** Action qui remplit la jauge de temps (une couleur chacune à l'écran). */
export type GaugeKind = 'study' | 'work' | 'sleep';

/** Part de la jauge remplie par une action, dans l'ordre où elles ont eu lieu. */
export type GaugeSegment = { kind: GaugeKind; amount: number };

export type GameState = {
  version: number;
  characterName: string;
  life: LifeSpan;

  /** Nombre de périodes écoulées depuis le départ. */
  period: number;
  /** Remplissage de la jauge de temps de la période en cours. */
  gauge: number;
  /** Ce qui remplit la jauge, dans l'ordre (leur somme vaut `gauge`). */
  gaugeSegments: GaugeSegment[];
  /** Remplissage à partir duquel une période passe. */
  gaugeCapacity: number;
  status: GameStatus;
  phase: LifePhase;

  /** Euros entiers. */
  money: number;
  stock: number;
  // Capacité de l'entrepôt : la production au-delà est perdue.
  stockCapacity: number;
  // Petits entrepôts achetés (chacun ajoute de la capacité).
  warehouses: number;
  reputation: number;
  // Total de réputation gagnée depuis le départ : dépenser ne le fait pas baisser.
  reputationEarned: number;

  stats: Record<StatId, number>;
  markers: StatId[];
  // Nombre maximum de marqueurs détenus (la capacité du cerveau).
  maxMarkers: number;
  // Le personnage dort et vide ses marqueurs un par un (un sommeil par période).
  isSleeping: boolean;
  // Durée du sommeil quotidien choisie par le joueur, en heures ; elle ne
  // sert qu'à partir de la période suivante (`periodSleepHours`).
  sleepHours: number;
  // Durée en vigueur pour la période en cours : coucher et coût.
  periodSleepHours: number;
  // Pas restants du sommeil en cours, pas du sommeil entier et jauge de temps
  // que coûte chaque pas.
  sleepLeft: number;
  sleepTotal: number;
  sleepStepGauge: number;
  // Marqueurs que le sommeil en cours peut encore vider.
  sleepConvertible: number;
  // Dernière période où le personnage s'est endormi (-1 : jamais).
  lastSleepPeriod: number;
  // Gestes manuels faits pendant le sommeil, rejoués au réveil (dans l'ordre).
  queuedActions: QueuedAction[];
  // Conversion du sommeil, selon le logement (studio : 1).
  sleepMultiplier: number;

  /** Graine du générateur aléatoire. */
  seed: number;

  jobId: string | null;
  // Valeurs dérivées des améliorations, des petits entrepôts et des facteurs
  // d'événements : logement, loyer, salaires des employés, capacité de stock,
  // marqueurs maximum, multiplicateurs. Elles ne s'écrivent que par
  // `withModifiers` (@game/upgrades), jamais à la main.
  housingId: string;
  rent: number;
  // Salaires des employés prélevés à chaque période.
  payroll: number;
  // Facteurs cumulés des événements sur le loyer et les salaires (1 au départ).
  rentFactor: number;
  payrollFactor: number;
  /** Nombre d'exemplaires possédés, par type d'entreprise. */
  companies: Record<string, number>;
  upgrades: string[];
  // Multiplicateurs de production et de ventes (alimentés par les améliorations).
  productionMultiplier: number;
  salesMultiplier: number;
  // Actions de travail faites cette période dans chaque entreprise.
  workBoosts: Record<string, number>;
  // Salaires gagnés cette période par emploi (id), versés à la clôture avec le
  // loyer : ils font monter la balance, pas l'argent.
  wagesDue: Record<string, number>;
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
  // Compteurs de courrier, qui ne font que croître : messages reçus, et
  // messages reçus à la dernière lecture (voir `@game/mail`).
  mailReceived: number;
  mailRead: number;
  // Nouveautés déjà vues par onglet (voir `@game/novelty`) : les ids débloqués
  // quand le joueur a ouvert l'onglet.
  seenItems: Record<
    'profile' | 'jobs' | 'companies' | 'upgrades' | 'city',
    string[]
  >;
  // Événements uniques déjà survenus.
  firedEvents: string[];
  activeEffects: ActiveEffect[];
  // Facteur de salaire par emploi (1 si absent).
  jobSalaryFactors: Record<string, number>;
  // Actions de travail en heures supplémentaires faites à chaque emploi (id),
  // cumulées sur la vie.
  overtimeActions: Record<string, number>;
  // Promotions déjà proposées par emploi (id), acceptées ou refusées.
  promotionsOffered: Record<string, number>;
  // Promotion qui attend une réponse : le jeu est arrêté tant qu'elle est là.
  pendingPromotion: PendingPromotion | null;

  // Interrupteurs des actions automatiques (activables une fois achetées).
  autoWork: boolean;
  // Temps (ms) accumulé vers la prochaine action automatique.
  autoElapsed: number;
  // Horodatage fourni par l'appelant (jamais lu par les règles). Écrit à la
  // sauvegarde (`serialize`) et au retour (`resume`), qui s'en sert pour rattraper l'absence.
  lastSeenAt: number | null;
};
