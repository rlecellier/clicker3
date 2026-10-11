import type { Requirement } from '@game/requirements';

export type District = {
  id: string;
  name: string;
  description: string;
  // Réputation dépensée pour débloquer le quartier.
  cost: number;
  requirement?: Requirement;
};

// Dans l'ordre de la carte (docs/game/ton-et-univers.md). Les Tilleuls sont
// ouverts au départ (voir startState). Coûts et seuils provisoires.
export const districts: readonly District[] = [
  {
    id: 'tilleuls',
    name: 'Les Tilleuls',
    description:
      'Lotissement de pavillons identiques, studio au-dessus d’un pressing. Aucun tilleul.',
    cost: 0,
  },
  {
    id: 'hauts-fourneaux',
    name: 'Les Hauts-Fourneaux',
    description:
      'Ancien quartier ouvrier en cours de requalification depuis 1987. « Demain commence ici. »',
    cost: 5,
    requirement: { type: 'reputationTier', tier: 1 },
  },
  {
    id: 'parc-horizon',
    name: 'Parc d’activités Horizon',
    description:
      'Zone commerciale et entrepôts en périphérie. Un rond-point à chaque entrée, aucun piéton.',
    cost: 15,
    requirement: { type: 'reputationTier', tier: 2 },
  },
  {
    id: 'pole-excellence',
    name: 'Le Pôle d’Excellence',
    description:
      'Centre d’affaires de verre. Vingt cabinets s’y occupent de se conseiller mutuellement.',
    cost: 40,
    requirement: { type: 'reputationTier', tier: 3 },
  },
];
