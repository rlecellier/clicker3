import type { Requirement } from '@game/requirements';

export type EventEffect =
  // Réputation gagnée (positive) ou perdue (négative).
  | { type: 'reputation'; amount: number }
  // Argent gagné ou perdu (peut mener à une dette).
  | { type: 'money'; amount: number }
  // Facteur sur l'argent possédé ; une dette n'est pas touchée.
  | { type: 'moneyFactor'; factor: number }
  // Dépense unique de n mois de loyer.
  | { type: 'oneOffRent'; months: number }
  | { type: 'rentFactor'; factor: number }
  | { type: 'payrollFactor'; factor: number }
  | { type: 'jobSalaryFactor'; jobIds: string[]; factor: number }
  // Effet qui s'arrête à une période donnée.
  | {
      type: 'temporary';
      kind: 'sales' | 'workSlow';
      value: number;
      untilPeriod: number;
    };

export type GameEvent = {
  id: string;
  // Texte du message ; {companies}, {money}, {age} et {reputation} viennent
  // de l'état au moment où l'événement survient.
  text: string;
  // Condition de déclenchement. Sans condition, l'événement est déclenché à
  // la main (ex. retour après absence).
  trigger?: Requirement;
  effects?: EventEffect[];
  // Un événement unique ne survient qu'une fois ; les autres, une fois par
  // période au plus.
  unique: boolean;
};

// Nombre maximum de lignes gardées dans le journal.
export const journalLimit = 200;

const period = (min: number): Requirement => ({ type: 'period', min });
const age = (min: number): Requirement => ({ type: 'age', min });

// Les dates sont des périodes : janvier 1999 = 0, un mois par période.
export const events: readonly GameEvent[] = [
  // Histoire du monde
  {
    id: 'euro',
    unique: true,
    trigger: period(0),
    text: "Bienvenue dans l'euro. Votre compte est crédité de 0 €, ce qui est un bon début.",
  },
  {
    id: 'bug-an-2000',
    unique: true,
    trigger: period(11),
    text: "Le système pourrait cesser de fonctionner. Un consultant vous propose de l'éviter. Le système a continué. Le consultant aussi.",
    effects: [{ type: 'oneOffRent', months: 1 }],
  },
  {
    id: 'bulle-internet',
    unique: true,
    trigger: period(14),
    text: "Tout le monde lance une start-up. Aucune n'a encore de produit. Les investisseurs adorent.",
    effects: [
      { type: 'temporary', kind: 'sales', value: 0.2, untilPeriod: 33 },
    ],
  },
  {
    id: 'krach',
    unique: true,
    trigger: period(33),
    text: "La nouvelle économie devient l'ancienne. Les actionnaires espèrent une reprise.",
    effects: [{ type: 'reputation', amount: -1 }],
  },
  {
    id: 'euro-fiduciaire',
    unique: true,
    trigger: period(36),
    text: 'Les francs disparaissent. Les prix, eux, avaient déjà arrondi.',
    effects: [{ type: 'rentFactor', factor: 1.05 }],
  },
  {
    id: 'crise-financiere',
    unique: true,
    trigger: period(116),
    text: "Une banque a fait faillite. L'État la sauve. Vous êtes invité à comprendre que c'est normal.",
    effects: [
      { type: 'rentFactor', factor: 1.1 },
      { type: 'payrollFactor', factor: 1.1 },
      { type: 'moneyFactor', factor: 0.9 },
    ],
  },
  {
    id: 'economie-collaborative',
    unique: true,
    trigger: period(156),
    text: 'Votre canapé est désormais un actif. Votre temps libre aussi.',
  },
  {
    id: 'confinement',
    unique: true,
    trigger: period(254),
    text: 'Les emplois essentiels sont reconnus. Les rémunérations restent à l’étude.',
    effects: [
      { type: 'temporary', kind: 'workSlow', value: 0.5, untilPeriod: 266 },
    ],
  },
  {
    id: 'intelligence-artificielle',
    unique: true,
    trigger: period(372),
    text: 'Votre poste a été optimisé par un outil qui ne dort pas. Félicitations pour votre évolution.',
    effects: [
      {
        type: 'jobSalaryFactor',
        jobIds: ['interim', 'polyvalent'],
        factor: 0.8,
      },
    ],
  },
  {
    id: 'climat',
    unique: true,
    trigger: period(552),
    text: 'Il fait très chaud à Sainte-Croissance. La climatisation est un service premium.',
    effects: [
      { type: 'rentFactor', factor: 1.1 },
      { type: 'payrollFactor', factor: 1.1 },
    ],
  },
  // Vie par âge
  {
    id: 'age-18',
    unique: true,
    trigger: age(18),
    text: 'Vous êtes majeur. Les offres de crédit aussi.',
  },
  {
    id: 'age-30',
    unique: true,
    trigger: age(30),
    text: 'Votre profil a évolué. Votre assurance aussi, dans le mauvais sens.',
  },
  {
    id: 'age-40',
    unique: true,
    trigger: age(40),
    text: 'Vous avez réussi, dit-on. Selon quel critère, on vous le dira.',
  },
  {
    id: 'age-60',
    unique: true,
    trigger: age(60),
    text: 'Vous passez Senior. Votre valeur d’expérience est reconnue, hors périmètre.',
  },
  {
    id: 'age-70',
    unique: true,
    trigger: age(70),
    text: 'Un conseiller en retraite vous contacte. Il a eu votre numéro par une entreprise que vous possédez.',
  },
  // État du jeu
  {
    id: 'loyer',
    unique: false,
    trigger: { type: 'statement', flag: 'rentPaid' },
    text: 'Votre bail a été renouvelé à des conditions plus ambitieuses.',
  },
  {
    id: 'impaye',
    unique: false,
    trigger: { type: 'statement', flag: 'unpaid' },
    text: 'Votre propriétaire a pris acte de votre situation. Il vous souhaite du courage.',
  },
  {
    id: 'premiere-entreprise',
    unique: true,
    trigger: { type: 'phase', phase: 'entrepreneur' },
    text: 'Vous êtes porteur de projet. Personne ne vous demande lequel.',
  },
  {
    id: 'premier-collaborateur',
    unique: true,
    trigger: { type: 'phase', phase: 'boss' },
    text: 'Vous êtes dirigeant. La différence avec un salarié : vous le dites.',
  },
  {
    id: 'rupture-stock',
    unique: false,
    trigger: { type: 'statement', flag: 'stockout' },
    text: 'Vos clients découvrent la rareté. Ils ne vous en sont pas reconnaissants.',
  },
  {
    id: 'stock-plein',
    unique: false,
    trigger: { type: 'statement', flag: 'stockFull' },
    text: 'Votre entrepôt déborde. La production continue, par principe.',
  },
  {
    id: 'reputation-1',
    unique: true,
    trigger: { type: 'reputationTier', tier: 1 },
    text: 'Partenaire de confiance. Vous avez un badge.',
  },
  {
    id: 'reputation-2',
    unique: true,
    trigger: { type: 'reputationTier', tier: 2 },
    text: 'Acteur majeur. Personne ne sait de quoi.',
  },
  {
    id: 'reputation-3',
    unique: true,
    trigger: { type: 'reputationTier', tier: 3 },
    text: 'Vous êtes devenu une marque. Votre nom figure dans un tableau Excel.',
  },
  {
    id: 'quartier-hauts-fourneaux',
    unique: true,
    trigger: { type: 'district', id: 'hauts-fourneaux' },
    text: 'Les Hauts-Fourneaux vous ouvrent leurs portes. Elles étaient fermées pour requalification.',
  },
  {
    id: 'quartier-parc-horizon',
    unique: true,
    trigger: { type: 'district', id: 'parc-horizon' },
    text: 'Le parc Horizon est ouvert à tous les véhicules.',
  },
  {
    id: 'quartier-pole-excellence',
    unique: true,
    trigger: { type: 'district', id: 'pole-excellence' },
    text: "Le Pôle d'Excellence vous accueille. Il vous demande d'abord votre budget.",
  },
  {
    id: 'retour-absence',
    unique: false,
    text: 'Pendant votre absence, la croissance a continué. Elle n’a pas demandé de vos nouvelles.',
  },
  {
    id: 'mort',
    unique: true,
    trigger: { type: 'dead' },
    text: 'You died. Votre exercice est terminé. Bilan : {companies} entreprises, 0 week-end.',
  },
];
