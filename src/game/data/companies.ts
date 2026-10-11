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

// Les six types (docs/game/ton-et-univers.md). Valeurs provisoires.
export const companies: readonly Company[] = [
  {
    id: 'atelier',
    name: 'Atelier d’assemblage',
    kind: 'production',
    baseCost: 200,
    growth: 1.1,
    output: 4,
    requirement: { type: 'stat', stat: 'gestion', tier: 1 },
  },
  {
    id: 'boutique',
    name: 'Boutique',
    kind: 'commerce',
    baseCost: 300,
    growth: 1.1,
    capacity: 4,
    price: 12,
    requirement: { type: 'stat', stat: 'gestion', tier: 1 },
  },
  {
    id: 'manufacture',
    name: 'Manufacture',
    kind: 'production',
    baseCost: 4000,
    growth: 1.12,
    output: 40,
    requirement: { type: 'stat', stat: 'gestion', tier: 2 },
  },
  {
    id: 'hypermarche',
    name: 'Hypermarché',
    kind: 'commerce',
    baseCost: 6000,
    growth: 1.12,
    capacity: 45,
    price: 13,
    requirement: {
      type: 'all',
      of: [
        { type: 'stat', stat: 'gestion', tier: 2 },
        { type: 'district', id: 'parc-horizon' },
      ],
    },
  },
  {
    id: 'site-delocalise',
    name: 'Site de production délocalisé',
    kind: 'production',
    baseCost: 80_000,
    growth: 1.15,
    output: 500,
    requirement: { type: 'stat', stat: 'gestion', tier: 3 },
  },
  {
    id: 'plateforme',
    name: 'Plateforme en ligne',
    kind: 'commerce',
    baseCost: 120_000,
    growth: 1.15,
    capacity: 600,
    price: 15,
    requirement: {
      type: 'all',
      of: [
        { type: 'stat', stat: 'gestion', tier: 3 },
        // Arrive vers 2000 (douzième période après le 1er janvier 1999).
        { type: 'period', min: 12 },
        { type: 'district', id: 'pole-excellence' },
      ],
    },
  },
];
