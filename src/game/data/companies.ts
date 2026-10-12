import type { Requirement } from '@game/requirements';

type CompanyBase = {
  id: string;
  name: string;
  // Coût du premier exemplaire, puis × growth à chaque exemplaire possédé.
  baseCost: number;
  growth: number;
  requirement?: Requirement;
};

export type ProductionCompany = CompanyBase & {
  kind: 'production';
  // Articles produits par période et par exemplaire.
  output: number;
};

export type CommerceCompany = CompanyBase & {
  kind: 'commerce';
  // Articles vendables par période et par exemplaire.
  capacity: number;
  // Euros par article vendu.
  price: number;
};

export type Company = ProductionCompany | CommerceCompany;

// Les six types (docs/game/ton-et-univers.md). Valeurs calées en V1-24 (docs/game/equilibrage.md).
export const companies: readonly Company[] = [
  {
    id: 'atelier',
    name: 'Atelier d’assemblage',
    kind: 'production',
    baseCost: 150,
    growth: 1.1,
    output: 2,
    requirement: { type: 'stat', stat: 'gestion', tier: 2 },
  },
  {
    id: 'boutique',
    name: 'Boutique',
    kind: 'commerce',
    baseCost: 250,
    growth: 1.1,
    capacity: 3,
    price: 12,
    requirement: { type: 'stat', stat: 'gestion', tier: 2 },
  },
  {
    id: 'manufacture',
    name: 'Manufacture',
    kind: 'production',
    baseCost: 13_000,
    growth: 1.1,
    output: 99,
    requirement: { type: 'stat', stat: 'gestion', tier: 4 },
  },
  {
    id: 'hypermarche',
    name: 'Hypermarché',
    kind: 'commerce',
    baseCost: 13_000,
    growth: 1.1,
    capacity: 87,
    price: 13,
    requirement: {
      type: 'all',
      of: [
        { type: 'stat', stat: 'gestion', tier: 5 },
        { type: 'district', id: 'parc-horizon' },
      ],
    },
  },
  {
    id: 'site-delocalise',
    name: 'Site de production délocalisé',
    kind: 'production',
    baseCost: 53_000,
    growth: 1.1,
    output: 210,
    requirement: { type: 'stat', stat: 'gestion', tier: 6 },
  },
  {
    id: 'plateforme',
    name: 'Plateforme en ligne',
    kind: 'commerce',
    baseCost: 66_000,
    growth: 1.1,
    capacity: 250,
    price: 15,
    requirement: {
      type: 'all',
      of: [
        { type: 'stat', stat: 'gestion', tier: 7 },
        // Arrive vers 2000 (douzième période après le 1er janvier 1999).
        { type: 'period', min: 12 },
        { type: 'district', id: 'pole-excellence' },
      ],
    },
  },
];
