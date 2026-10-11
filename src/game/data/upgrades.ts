import { companies } from './companies';
import type { Requirement } from '@game/requirements';

export type UpgradeEffect =
  // Étudier donne des marqueurs de la stat du cursus.
  | { type: 'course'; courseId: string }
  // Logement : conversion du sommeil.
  | { type: 'housing'; housingId: string; sleepMultiplier: number }
  | { type: 'stockCapacity'; factor: number }
  | { type: 'maxMarkers'; add: number }
  // Production +x, de tout le monde ou d'un seul type d'entreprise.
  | { type: 'productionBonus'; bonus: number; companyId?: string }
  | { type: 'salesBonus'; bonus: number }
  // Production et ventes de toutes les entreprises.
  | { type: 'allBonus'; bonus: number }
  // Réputation gagnée par le travail de l'emploi.
  | { type: 'workReputation'; bonus: number }
  // Réputation gagnée par vente.
  | { type: 'reputationPerSale'; bonus: number }
  // Un employé de plus (salaire dans `payroll`).
  | { type: 'employee' }
  // Rien d'actif ici : branché dans V1-11.
  | { type: 'automation'; action: 'work' | 'sleep' }
  | { type: 'dashboard' };

export type Upgrade = {
  id: string;
  name: string;
  description: string;
  price: number;
  // Loyer ajouté à chaque période.
  rent?: number;
  // Salaires ajoutés à chaque période.
  payroll?: number;
  requirement?: Requirement;
  effects: UpgradeEffect[];
};

// Au moins une entreprise possédée.
const anyCompany: Requirement = {
  type: 'any',
  of: companies.map((company) => ({ type: 'company', id: company.id })),
};

const stat = (
  name: 'metier' | 'gestion' | 'intelligence' | 'endurance',
  tier: number,
): Requirement => ({ type: 'stat', stat: name, tier });

// Les 20 améliorations (docs/game/ameliorations-et-evenements.md).
// Prix et effets : ordres de grandeur à caler au simulateur.
export const upgrades: readonly Upgrade[] = [
  // Formations
  {
    id: 'stage-posture',
    name: 'Stage « Posture professionnelle »',
    description: 'Deux jours pour apprendre à sourire sans y croire.',
    price: 150,
    effects: [{ type: 'course', courseId: 'metier' }],
  },
  {
    id: 'bts-opportunites',
    name: 'BTS « Gestion des opportunités »',
    description: 'Une opportunité se gère comme un risque, en moins amusant.',
    price: 1500,
    requirement: stat('metier', 1),
    effects: [{ type: 'course', courseId: 'gestion' }],
  },
  {
    id: 'licence-economie',
    name: "Licence d'économie appliquée",
    description:
      "Vous apprenez que tout est une question d'offre et de demande, sauf vous.",
    price: 6000,
    requirement: stat('gestion', 1),
    effects: [{ type: 'course', courseId: 'intelligence' }],
  },
  {
    id: 'coaching-depassement',
    name: 'Coaching « Dépassement de soi »',
    description: 'On vous explique que la fatigue est une croyance limitante.',
    price: 12_000,
    requirement: stat('intelligence', 1),
    effects: [{ type: 'course', courseId: 'endurance' }],
  },
  // Logement
  {
    id: 'studio-renove',
    name: 'Studio rénové',
    description: 'Rénové : un coup de peinture et une nouvelle moisissure.',
    price: 4000,
    rent: 150,
    requirement: stat('endurance', 1),
    effects: [
      { type: 'housing', housingId: 'studio-renove', sleepMultiplier: 1.5 },
    ],
  },
  {
    id: 'pavillon-tilleuls',
    name: 'Pavillon aux Tilleuls',
    description:
      'Quatre pièces, un crédit sur vingt-cinq ans. Le jardin est inclus.',
    price: 40_000,
    rent: 600,
    requirement: stat('endurance', 2),
    effects: [
      { type: 'housing', housingId: 'pavillon-tilleuls', sleepMultiplier: 2.5 },
    ],
  },
  {
    id: 'loft-pole',
    name: "Loft au Pôle d'Excellence",
    description: 'Vue sur d’autres lofts. Prix « dynamique ».',
    price: 400_000,
    rent: 3000,
    requirement: stat('endurance', 3),
    effects: [{ type: 'housing', housingId: 'loft-pole', sleepMultiplier: 4 }],
  },
  // Entrepôt et marqueurs
  {
    id: 'etageres-kit',
    name: 'Étagères en kit',
    description: 'Montage en une heure. Le fabricant dit trois.',
    price: 2000,
    requirement: stat('gestion', 1),
    effects: [{ type: 'stockCapacity', factor: 2 }],
  },
  {
    id: 'entrepot-logistique',
    name: 'Entrepôt logistique',
    description:
      'Un hangar à la sortie du rond-point. Il y en avait déjà vingt.',
    price: 80_000,
    requirement: stat('gestion', 3),
    effects: [{ type: 'stockCapacity', factor: 5 }],
  },
  {
    id: 'carnet-notes',
    name: 'Carnet de notes',
    description:
      'Écrire ses objectifs rend 30 % plus performant. Source : un carnet.',
    price: 800,
    requirement: stat('intelligence', 1),
    effects: [{ type: 'maxMarkers', add: 2 }],
  },
  {
    id: 'application-productivite',
    name: 'Application de productivité',
    description: 'Vous avez maintenant une application pour vos applications.',
    price: 25_000,
    requirement: stat('intelligence', 3),
    effects: [{ type: 'maxMarkers', add: 3 }],
  },
  // Employés
  {
    id: 'premier-collaborateur',
    name: 'Premier collaborateur',
    description:
      'Pas un salarié : un collaborateur. Il le saura à la fiche de paie.',
    price: 3000,
    payroll: 900,
    requirement: { type: 'all', of: [stat('gestion', 2), anyCompany] },
    effects: [{ type: 'employee' }, { type: 'productionBonus', bonus: 0.5 }],
  },
  {
    id: 'equipe-collaborateurs',
    name: 'Équipe de collaborateurs',
    description: "Ils se sentent écoutés. Ils n'ont pas d'augmentation.",
    price: 30_000,
    payroll: 6000,
    requirement: {
      type: 'all',
      of: [stat('gestion', 3), { type: 'reputationTier', tier: 1 }],
    },
    effects: [{ type: 'employee' }, { type: 'allBonus', bonus: 0.5 }],
  },
  {
    id: 'directeur-transformation',
    name: 'Directeur de la transformation',
    description: 'Il transforme. Quoi ? Il reviendra vers vous.',
    price: 300_000,
    payroll: 25_000,
    requirement: {
      type: 'all',
      of: [stat('gestion', 4), { type: 'reputationTier', tier: 2 }],
    },
    effects: [{ type: 'employee' }, { type: 'allBonus', bonus: 1 }],
  },
  // Automatisations
  {
    id: 'procedure-travail',
    name: 'Procédure de travail',
    description: 'Le travail se fait seul. Vous le surveillerez de loin.',
    price: 20_000,
    requirement: { type: 'phase', phase: 'boss' },
    effects: [{ type: 'automation', action: 'work' }],
  },
  {
    id: 'rythme-sommeil',
    name: 'Rythme de sommeil optimisé',
    description: 'Vous dormez quand les chiffres le disent. Ils ont raison.',
    price: 35_000,
    requirement: stat('intelligence', 2),
    effects: [{ type: 'automation', action: 'sleep' }],
  },
  {
    id: 'tableau-de-bord',
    name: 'Tableau de bord',
    description:
      'Dix indicateurs. Un seul qui compte, que vous ne regardez pas.',
    price: 5000,
    requirement: stat('gestion', 2),
    effects: [{ type: 'dashboard' }],
  },
  // Matériel et réputation
  {
    id: 'cartes-visite',
    name: 'Cartes de visite',
    description: 'Papier épais. Le prénom ne figure pas, par souci de marque.',
    price: 100,
    effects: [{ type: 'workReputation', bonus: 0.25 }],
  },
  {
    id: 'camionnette',
    name: "Camionnette d'occasion",
    description: '240 000 km. Le compteur a été remis à l’honneur.',
    price: 7000,
    requirement: anyCompany,
    effects: [{ type: 'productionBonus', bonus: 0.25, companyId: 'atelier' }],
  },
  {
    id: 'plan-communication',
    name: 'Plan de communication',
    description: 'Votre histoire, mais en mieux. Surtout la fin.',
    price: 60_000,
    requirement: { type: 'reputationTier', tier: 2 },
    effects: [
      { type: 'salesBonus', bonus: 0.25 },
      { type: 'reputationPerSale', bonus: 0.5 },
    ],
  },
];
