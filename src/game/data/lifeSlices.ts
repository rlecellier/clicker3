import type { LifeSliceId } from '@game/state';
import { adulthoodStart, maturityStart, oldAgeStart } from './sliceStarts';
import type { SliceStart } from './sliceStarts';

export type LifeSlice = {
  id: LifeSliceId;
  name: string;
  ages: string;
  // Onglets de l'écran de jeu proposés dans cette tranche, dans l'ordre de la sidebar.
  tabs: readonly string[];
  // Tranche avant 18 ans : un seul bouton d'action qui fait monter un compteur.
  // `null` pour Jeunesse, qui a toutes ses règles.
  growth: { actionLabel: string; counterLabel: string } | null;
  // Départ plus loin dans le jeu complet, avec son état arbitraire. `null` :
  // le départ du jeu (Jeunesse) ou un mini-jeu d'avant 18 ans.
  start: SliceStart | null;
};

// Les onglets du jeu complet, dans l'ordre de la sidebar.
const gameTabIds = [
  'mail',
  'life',
  'profile',
  'jobs',
  'companies',
  'upgrades',
  'accounts',
  'finance',
  'city',
] as const;

// Dans l'ordre de la vie. Jeunesse est le jeu complet, de 18 ans à la mort ;
// les trois dernières tranches en reprennent le cours à un âge plus avancé.
export const lifeSlices: readonly LifeSlice[] = [
  {
    id: 'earlyChildhood',
    name: 'Petite enfance',
    ages: '0 à 5 ans',
    tabs: ['life', 'house'],
    growth: { actionLabel: 'Gazouiller', counterLabel: 'Éveil' },
    start: null,
  },
  {
    id: 'childhood',
    name: 'Enfance',
    ages: '6 à 12 ans',
    tabs: ['life'],
    growth: { actionLabel: 'Jouer', counterLabel: 'Curiosité' },
    start: null,
  },
  {
    id: 'adolescence',
    name: 'Adolescence',
    ages: '13 à 17 ans',
    tabs: ['life'],
    growth: { actionLabel: 'Se chercher', counterLabel: 'Identité' },
    start: null,
  },
  {
    id: 'youth',
    name: 'Jeunesse',
    ages: '18 à 29 ans',
    tabs: gameTabIds,
    growth: null,
    start: null,
  },
  {
    id: 'adulthood',
    name: 'Âge adulte',
    ages: '30 à 49 ans',
    tabs: gameTabIds,
    growth: null,
    start: adulthoodStart,
  },
  {
    id: 'maturity',
    name: 'Maturité',
    ages: '50 à 64 ans',
    tabs: gameTabIds,
    growth: null,
    start: maturityStart,
  },
  {
    id: 'oldAge',
    name: 'Vieillesse',
    ages: '65 ans à la fin',
    tabs: gameTabIds,
    growth: null,
    start: oldAgeStart,
  },
];
