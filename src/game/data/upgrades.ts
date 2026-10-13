import { companies } from './companies';
import type { Requirement } from '@game/requirements';
import type { StatId } from '@game/state';

export type UpgradeEffect =
  // Étudier donne des marqueurs de la stat du cursus.
  | { type: 'course'; courseId: string }
  // Logement : conversion du sommeil.
  | { type: 'housing'; housingId: string; sleepMultiplier: number }
  | { type: 'stockCapacity'; factor: number }
  | { type: 'maxMarkers'; add: number }
  // Chance de marqueur relevée de ce bonus (0,3 : 30 % de plus).
  | { type: 'markerChance'; bonus: number }
  // Production +x, de tout le monde ou d'un seul type d'entreprise.
  | { type: 'productionBonus'; bonus: number; companyId?: string }
  | { type: 'salesBonus'; bonus: number }
  // Montée en gamme : le débit (articles produits ou vendables) de tous les
  // exemplaires d'un type d'entreprise.
  | { type: 'companyBonus'; companyId: string; bonus: number }
  // Production et ventes de toutes les entreprises.
  | { type: 'allBonus'; bonus: number }
  // Réputation gagnée par le travail de l'emploi.
  | { type: 'workReputation'; bonus: number }
  // Réputation gagnée par vente.
  | { type: 'reputationPerSale'; bonus: number }
  // Un employé de plus (salaire dans `payroll`).
  | { type: 'employee' }
  // Rien d'actif ici : branché dans V1-11.
  | { type: 'automation'; action: 'work' }
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

const stat = (name: StatId, tier: number): Requirement => ({
  type: 'stat',
  stat: name,
  tier,
});

// Les améliorations (docs/game/ameliorations-et-evenements.md).
// Prix et effets calés en V1-24 (docs/game/equilibrage.md).
export const upgrades: readonly Upgrade[] = [
  // Formations
  {
    id: 'stage-posture',
    name: 'Stage « Posture professionnelle »',
    description: 'Deux jours pour apprendre à sourire sans y croire.',
    price: 420,
    effects: [{ type: 'course', courseId: 'metier' }],
  },
  {
    id: 'bts-opportunites',
    name: 'BTS « Gestion des opportunités »',
    description: 'Une opportunité se gère comme un risque, en moins amusant.',
    price: 4200,
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
    price: 3800,
    requirement: stat('intelligence', 1),
    effects: [{ type: 'course', courseId: 'endurance' }],
  },
  // Logement
  {
    id: 'studio-renove',
    name: 'Studio rénové',
    description: 'Rénové : un coup de peinture et une nouvelle moisissure.',
    price: 800,
    rent: 95,
    requirement: stat('endurance', 1),
    effects: [
      { type: 'housing', housingId: 'studio-renove', sleepMultiplier: 1.3 },
    ],
  },
  {
    id: 'pavillon-tilleuls',
    name: 'Pavillon aux Tilleuls',
    description:
      'Quatre pièces, un crédit sur vingt-cinq ans. Le jardin est inclus.',
    price: 27_000,
    rent: 700,
    requirement: stat('endurance', 3),
    effects: [
      { type: 'housing', housingId: 'pavillon-tilleuls', sleepMultiplier: 2.6 },
    ],
  },
  {
    id: 'loft-pole',
    name: "Loft au Pôle d'Excellence",
    description: 'Vue sur d’autres lofts. Prix « dynamique ».',
    price: 92_000,
    rent: 1950,
    requirement: stat('endurance', 5),
    effects: [
      { type: 'housing', housingId: 'loft-pole', sleepMultiplier: 3.25 },
    ],
  },
  // Entrepôt et marqueurs
  {
    id: 'etageres-kit',
    name: 'Étagères en kit',
    description: 'Montage en une heure. Le fabricant dit trois.',
    price: 13_000,
    requirement: stat('gestion', 3),
    effects: [{ type: 'stockCapacity', factor: 120 }],
  },
  {
    id: 'entrepot-logistique',
    name: 'Entrepôt logistique',
    description:
      'Un hangar à la sortie du rond-point. Il y en avait déjà vingt.',
    price: 34_000,
    requirement: stat('gestion', 6),
    effects: [{ type: 'stockCapacity', factor: 18 }],
  },
  {
    id: 'agenda-electronique',
    name: 'Agenda électronique',
    description:
      'Écrire ses objectifs rend 30 % plus performant. Source : un agenda.',
    price: 380,
    requirement: stat('intelligence', 1),
    effects: [{ type: 'markerChance', bonus: 0.3 }],
  },
  {
    id: 'assistante-direction',
    name: 'Assistante de direction',
    description:
      'Elle classe, relance et protège votre agenda. Vous ne savez plus ce que vous faisiez sans elle.',
    price: 7500,
    payroll: 1600,
    requirement: stat('intelligence', 4),
    effects: [{ type: 'allBonus', bonus: 0.62 }],
  },
  // Employés
  {
    id: 'premier-collaborateur',
    name: 'Premier collaborateur',
    description:
      'Pas un salarié : un collaborateur. Il le saura à la fiche de paie.',
    price: 800,
    payroll: 1450,
    requirement: { type: 'all', of: [stat('gestion', 3), anyCompany] },
    effects: [{ type: 'employee' }, { type: 'productionBonus', bonus: 1.9 }],
  },
  {
    id: 'equipe-collaborateurs',
    name: 'Équipe de collaborateurs',
    description: "Ils se sentent écoutés. Ils n'ont pas d'augmentation.",
    price: 78_000,
    payroll: 7000,
    requirement: {
      type: 'all',
      of: [stat('gestion', 5), { type: 'reputationTier', tier: 1 }],
    },
    effects: [{ type: 'employee' }, { type: 'allBonus', bonus: 0.48 }],
  },
  {
    id: 'directeur-transformation',
    name: 'Directeur de la transformation',
    description: 'Il transforme. Quoi ? Il reviendra vers vous.',
    price: 320_000,
    payroll: 15_000,
    requirement: {
      type: 'all',
      of: [stat('gestion', 8), { type: 'reputationTier', tier: 2 }],
    },
    effects: [{ type: 'employee' }, { type: 'allBonus', bonus: 1.4 }],
  },
  // Automatisations
  {
    id: 'procedure-travail',
    name: 'Procédure de travail',
    description: 'Le travail se fait seul. Vous le surveillerez de loin.',
    price: 640_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'phase', phase: 'boss' },
        stat('intelligence', 8),
        stat('gestion', 8),
        stat('endurance', 7),
        stat('metier', 8),
      ],
    },
    effects: [{ type: 'automation', action: 'work' }],
  },
  {
    id: 'tableau-de-bord',
    name: 'Tableau de bord',
    description:
      'Dix indicateurs. Un seul qui compte, que vous ne regardez pas.',
    price: 5200,
    requirement: stat('gestion', 4),
    effects: [{ type: 'dashboard' }],
  },
  // Montée en gamme : trois niveaux par type d’entreprise, qui multiplient le
  // débit de tous les exemplaires (docs/game/equilibrage.md, issue #167).
  {
    id: 'ligne-semi-automatisee',
    name: 'Ligne semi-automatisée',
    description:
      'Les ouvriers surveillent les machines. Les machines ne surveillent personne.',
    price: 110_000,
    requirement: { type: 'company', id: 'atelier', count: 2 },
    effects: [{ type: 'companyBonus', companyId: 'atelier', bonus: 0.28 }],
  },
  {
    id: 'ligne-automatisee',
    name: 'Ligne automatisée',
    description:
      'Plus personne ne touche la pièce. On a gardé quelqu’un pour la photo.',
    price: 19_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'ligne-semi-automatisee' },
        { type: 'company', id: 'atelier', count: 3 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'atelier', bonus: 3 }],
  },
  {
    id: 'atelier-sans-lumiere',
    name: 'Atelier sans lumière',
    description:
      'Éteint, il produit pareil. On a compris à la facture d’électricité.',
    price: 970_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'ligne-automatisee' },
        { type: 'company', id: 'atelier', count: 4 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'atelier', bonus: 0.26 }],
  },
  {
    id: 'enseigne-regionale',
    name: 'Enseigne régionale',
    description: 'Un néon plus grand et un slogan que personne ne retient.',
    price: 3_000_000,
    requirement: { type: 'company', id: 'boutique', count: 2 },
    effects: [{ type: 'companyBonus', companyId: 'boutique', bonus: 0.55 }],
  },
  {
    id: 'enseigne-nationale',
    name: 'Enseigne nationale',
    description:
      'Le même magasin partout, et enfin un logo que l’on reconnaît.',
    price: 76_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'enseigne-regionale' },
        { type: 'company', id: 'boutique', count: 3 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'boutique', bonus: 3 }],
  },
  {
    id: 'franchise-internationale',
    name: 'Franchise internationale',
    description: 'Le concept voyage mieux que les clients.',
    price: 46_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'enseigne-nationale' },
        { type: 'company', id: 'boutique', count: 4 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'boutique', bonus: 0.19 }],
  },
  {
    id: 'machines-outils-neuves',
    name: 'Machines-outils neuves',
    description:
      'Les anciennes sont parties à la casse, avec leurs défauts de fabrication.',
    price: 7_100_000,
    requirement: { type: 'company', id: 'manufacture', count: 3 },
    effects: [{ type: 'companyBonus', companyId: 'manufacture', bonus: 0.67 }],
  },
  {
    id: 'chaine-robotisee',
    name: 'Chaîne robotisée',
    description:
      'Elle ne se met jamais en grève. Elle tombe en panne, mais poliment.',
    price: 8_600_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'machines-outils-neuves' },
        { type: 'company', id: 'manufacture', count: 4 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'manufacture', bonus: 1.4 }],
  },
  {
    id: 'usine-du-futur',
    name: 'Usine du futur',
    description:
      'Une visite guidée par semaine. La production se fait le reste du temps.',
    price: 47_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'chaine-robotisee' },
        { type: 'company', id: 'manufacture', count: 6 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'manufacture', bonus: 2.8 }],
  },
  {
    id: 'tete-de-gondole',
    name: 'Tête de gondole',
    description: 'Le rayon que tout le monde croise en allant aux toilettes.',
    price: 1_200_000,
    requirement: { type: 'company', id: 'hypermarche', count: 4 },
    effects: [{ type: 'companyBonus', companyId: 'hypermarche', bonus: 2.1 }],
  },
  {
    id: 'rayon-complet',
    name: 'Rayon complet',
    description: 'On y trouve tout, sauf ce que l’on était venu chercher.',
    price: 22_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'tete-de-gondole' },
        { type: 'company', id: 'hypermarche', count: 6 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'hypermarche', bonus: 2.7 }],
  },
  {
    id: 'galerie-marchande',
    name: 'Galerie marchande',
    description: 'Le corner a fini par avoir ses propres corners.',
    price: 73_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'rayon-complet' },
        { type: 'company', id: 'hypermarche', count: 8 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'hypermarche', bonus: 0.1 }],
  },
  {
    id: 'equipes-3x8',
    name: 'Équipes en 3 × 8',
    description: 'Le soleil ne se couche jamais sur le site. Les équipes, si.',
    price: 530_000,
    requirement: { type: 'company', id: 'site-delocalise', count: 1 },
    effects: [
      { type: 'companyBonus', companyId: 'site-delocalise', bonus: 2.2 },
    ],
  },
  {
    id: 'second-site',
    name: 'Second site',
    description: 'Même usine, même cahier des charges, autre fuseau horaire.',
    price: 84_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'equipes-3x8' },
        { type: 'company', id: 'site-delocalise', count: 2 },
      ],
    },
    effects: [
      { type: 'companyBonus', companyId: 'site-delocalise', bonus: 2.3 },
    ],
  },
  {
    id: 'zone-franche',
    name: 'Zone franche',
    description: 'Ici, pas d’impôts, pas de syndicat, pas de questions.',
    price: 62_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'second-site' },
        { type: 'company', id: 'site-delocalise', count: 2 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'site-delocalise', bonus: 1 }],
  },
  {
    id: 'moteur-recommandation',
    name: 'Moteur de recommandation',
    description:
      'Les clients qui ont acheté cet article ont aussi acheté cet article.',
    price: 24_000_000,
    requirement: { type: 'company', id: 'plateforme', count: 2 },
    effects: [{ type: 'companyBonus', companyId: 'plateforme', bonus: 2.1 }],
  },
  {
    id: 'livraison-24h',
    name: 'Livraison en 24 h',
    description:
      'Le colis arrive avant la commande. Le livreur, un peu plus tard.',
    price: 530_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'moteur-recommandation' },
        { type: 'company', id: 'plateforme', count: 3 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'plateforme', bonus: 0.22 }],
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description:
      'Les autres vendent, vous encaissez la commission. C’est ça, le commerce.',
    price: 2_000_000_000,
    requirement: {
      type: 'all',
      of: [
        { type: 'upgrade', id: 'livraison-24h' },
        { type: 'company', id: 'plateforme', count: 4 },
      ],
    },
    effects: [{ type: 'companyBonus', companyId: 'plateforme', bonus: 0.11 }],
  },
  // Matériel et réputation
  {
    id: 'cartes-visite',
    name: 'Cartes de visite',
    description: 'Papier épais. Le prénom ne figure pas, par souci de marque.',
    price: 58,
    effects: [{ type: 'workReputation', bonus: 0.25 }],
  },
  {
    id: 'camionnette',
    name: "Camionnette d'occasion",
    description: '240 000 km. Le compteur a été remis à l’honneur.',
    price: 5750,
    requirement: anyCompany,
    effects: [
      { type: 'companyBonus', companyId: 'stand', bonus: 0.15 },
      { type: 'companyBonus', companyId: 'boutique', bonus: 0.15 },
    ],
  },
  {
    id: 'plan-communication',
    name: 'Plan de communication',
    description: 'Votre histoire, mais en mieux. Surtout la fin.',
    price: 19_000,
    requirement: { type: 'reputationTier', tier: 2 },
    effects: [
      { type: 'salesBonus', bonus: 0.3 },
      { type: 'reputationPerSale', bonus: 0.5 },
    ],
  },
];
