import type { Requirement } from '@game/requirements';
import type { ActiveEffect } from '@game/state';

export type Boost = {
  id: string;
  name: string;
  description: string;
  price: number;
  // Durée en périodes (une période : un mois).
  duration: number;
  requirement: Requirement;
  // Effet temporaire posé dans `activeEffects` à l'achat.
  kind: Exclude<ActiveEffect['kind'], 'sales' | 'workSlow' | 'stocksRate'>;
  value: number;
};

// Coups de pouce légaux, achetables et temporaires (docs/game/equilibrage.md).
export const boosts: readonly Boost[] = [
  {
    id: 'cure-ginkgo',
    name: 'Cure de ginkgo biloba',
    description: 'Trois mois de gélules. Le pharmacien promet beaucoup.',
    price: 20,
    duration: 3,
    requirement: { type: 'stat', stat: 'intelligence', tier: 3 },
    kind: 'markerChance',
    value: 0.1,
  },
  {
    id: 'seminaire-intensif',
    name: 'Séminaire intensif « Mémoire totale »',
    description:
      'Six mois de méthode. Étudier donne deux marqueurs au lieu d’un.',
    price: 4500,
    duration: 6,
    requirement: { type: 'stat', stat: 'intelligence', tier: 5 },
    kind: 'studyMarkers',
    value: 1,
  },
  {
    id: 'clinique-sommeil',
    name: 'Clinique du sommeil de Montreux',
    description: 'Une semaine de repos encadré, un an d’effets. Sommeil × 2.',
    price: 25_000,
    duration: 12,
    requirement: { type: 'stat', stat: 'endurance', tier: 5 },
    kind: 'sleepBoost',
    value: 1,
  },
];
