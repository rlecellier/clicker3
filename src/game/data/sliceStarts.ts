import type { PlacementId, StatId } from '@game/state';

// État de départ d'une tranche de vie qui reprend le jeu complet plus tard
// dans la vie (docs/game/tranches-de-vie.md). Ce que le joueur virtuel du
// simulateur possède à cet âge, arrondi : l'arbitraire est dans le choix de
// l'âge, pas dans les chiffres. Les champs dérivés (loyer, salaires, capacité
// du stock, logement) ne s'écrivent pas ici : ils découlent des améliorations.
export type SliceStart = {
  age: number;
  jobId: string;
  money: number;
  stock: number;
  reputation: number;
  // Total de réputation gagnée depuis le départ (`reputationEarned`).
  reputationEarned: number;
  stats: Record<StatId, number>;
  // Nombre possédé de chaque entreprise.
  companies: Record<string, number>;
  // Dans l'ordre d'achat.
  upgrades: readonly string[];
  districts: readonly string[];
  warehouses: number;
  // Capital placé par compte (jamais plus que `money`).
  placements: Record<PlacementId, number>;
  autoWork: boolean;
};

const adulthoodUpgrades = [
  'cartes-visite',
  'stage-posture',
  'bts-opportunites',
  'camionnette',
  'premier-collaborateur',
  'licence-economie',
  'agenda-electronique',
  'coaching-depassement',
  'studio-renove',
  'tableau-de-bord',
  'etageres-kit',
  'plan-communication',
] as const;

const maturityUpgrades = [
  ...adulthoodUpgrades,
  'assistante-direction',
  'pavillon-tilleuls',
  'entrepot-logistique',
  'equipe-collaborateurs',
  'loft-pole',
  'ligne-semi-automatisee',
  'ligne-automatisee',
  'directeur-transformation',
  'procedure-travail',
] as const;

const oldAgeUpgrades = [
  ...maturityUpgrades,
  'atelier-sans-lumiere',
  'tete-de-gondole',
  'enseigne-regionale',
  'enseigne-nationale',
  'equipes-3x8',
] as const;

const allDistricts = [
  'tilleuls',
  'hauts-fourneaux',
  'parc-horizon',
  'pole-excellence',
] as const;

export const adulthoodStart: SliceStart = {
  age: 30,
  jobId: 'mission',
  money: 12_000,
  stock: 8000,
  reputation: 430,
  reputationEarned: 540,
  stats: { metier: 205, gestion: 65, intelligence: 38, endurance: 2 },
  companies: { etabli: 3, stand: 4, atelier: 1 },
  upgrades: adulthoodUpgrades,
  districts: allDistricts,
  warehouses: 55,
  placements: { savings: 6000, ldds: 0, pel: 0, stocks: 0 },
  autoWork: false,
};

export const maturityStart: SliceStart = {
  age: 50,
  jobId: 'transformation',
  money: 480_000,
  stock: 1_480_000,
  reputation: 7180,
  reputationEarned: 7310,
  stats: { metier: 816, gestion: 1378, intelligence: 714, endurance: 376 },
  companies: { etabli: 3, stand: 4, atelier: 3, boutique: 4, hypermarche: 2 },
  upgrades: maturityUpgrades,
  districts: allDistricts,
  warehouses: 55,
  placements: { savings: 22_000, ldds: 12_000, pel: 61_000, stocks: 285_000 },
  autoWork: true,
};

export const oldAgeStart: SliceStart = {
  age: 65,
  jobId: 'transformation',
  money: 2_480_000,
  stock: 6_860_000,
  reputation: 42_700,
  reputationEarned: 42_870,
  stats: { metier: 2740, gestion: 1378, intelligence: 714, endurance: 376 },
  companies: {
    etabli: 3,
    stand: 4,
    atelier: 4,
    boutique: 4,
    hypermarche: 8,
    manufacture: 6,
    'site-delocalise': 1,
  },
  upgrades: oldAgeUpgrades,
  districts: allDistricts,
  warehouses: 90,
  placements: { savings: 22_000, ldds: 12_000, pel: 61_000, stocks: 1_880_000 },
  autoWork: true,
};
