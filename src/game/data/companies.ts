import type { Requirement } from '@game/requirements';

type CompanyBase = {
  id: string;
  name: string;
  // Apport du premier exemplaire (le prix affiché), puis × growth à chaque
  // exemplaire possédé.
  baseCost: number;
  growth: number;
  // Plafond d'exemplaires dans le quartier où l'entreprise s'établit (celui
  // de `impactRules.companyDistricts`) : au-delà,
  // la croissance passe par la montée en gamme (une amélioration par type).
  maxCopies: number;
  // Mensualité du crédit par exemplaire : le prix affiché est l'apport, le
  // reste est emprunté (docs/game/equilibrage.md). Prélevée à chaque période.
  charges: number;
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

// Les huit types, à l'échelle réelle de 1999 (docs/game/entreprises.md). Le
// prix de base est l'**apport** (20 % de la valeur) et `charges` la mensualité
// d'un crédit à 6 % sur 7 ans pour les 80 % restants. Plafonds, croissance,
// débits et charges calés au simulateur (docs/game/equilibrage.md).
export const companies: readonly Company[] = [
  {
    id: 'etabli',
    name: 'Établi au garage',
    kind: 'production',
    baseCost: 800,
    growth: 1.64,
    maxCopies: 3,
    charges: 0,
    output: 10,
    requirement: { type: 'stat', stat: 'gestion', tier: 1 },
  },
  {
    id: 'stand',
    name: 'Stand au marché',
    kind: 'commerce',
    baseCost: 1400,
    growth: 1.57,
    maxCopies: 4,
    charges: 100,
    capacity: 29,
    price: 12,
    requirement: { type: 'stat', stat: 'gestion', tier: 1 },
  },
  {
    id: 'atelier',
    name: 'Atelier d’assemblage',
    kind: 'production',
    baseCost: 16_000,
    growth: 1.61,
    maxCopies: 4,
    charges: 234,
    output: 170,
    requirement: { type: 'stat', stat: 'gestion', tier: 2 },
  },
  {
    id: 'boutique',
    name: 'Boutique',
    kind: 'commerce',
    baseCost: 28_000,
    growth: 1.99,
    maxCopies: 4,
    charges: 409,
    capacity: 110,
    price: 13,
    requirement: { type: 'stat', stat: 'gestion', tier: 2 },
  },
  {
    id: 'manufacture',
    name: 'Manufacture',
    kind: 'production',
    baseCost: 890_000,
    growth: 1.33,
    maxCopies: 6,
    charges: 12_994,
    output: 930,
    requirement: { type: 'stat', stat: 'gestion', tier: 4 },
  },
  {
    id: 'hypermarche',
    name: 'Corner en hypermarché',
    kind: 'commerce',
    baseCost: 380_000,
    growth: 1.32,
    maxCopies: 8,
    charges: 5548,
    capacity: 470,
    price: 12,
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
    baseCost: 6_200_000,
    growth: 2.3,
    maxCopies: 2,
    charges: 90_520,
    output: 4000,
    requirement: { type: 'stat', stat: 'gestion', tier: 6 },
  },
  {
    id: 'plateforme',
    name: 'Plateforme en ligne',
    kind: 'commerce',
    baseCost: 8_400_000,
    growth: 1.23,
    maxCopies: 4,
    charges: 122_640,
    capacity: 9600,
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
