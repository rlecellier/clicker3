import type { LifeSliceId } from '@game/state';
import { adulthoodStart, maturityStart, oldAgeStart } from './sliceStarts';
import type { SliceStart } from './sliceStarts';

export type LifeSlice = {
  id: LifeSliceId;
  name: string;
  ages: string;
  // Âge où la tranche commence et sommeil de base (heures par jour) tant qu'on
  // y est : il change quand la vie avance (docs/game/sommeil.md).
  fromAge: number;
  sleepBaseHours: number;
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
    fromAge: 0,
    sleepBaseHours: 12,
    name: 'Petite enfance',
    ages: '0 à 5 ans',
    tabs: ['life', 'house'],
    growth: { actionLabel: 'Gazouiller', counterLabel: 'Éveil' },
    start: null,
  },
  {
    id: 'childhood',
    fromAge: 6,
    sleepBaseHours: 10,
    name: 'Enfance',
    ages: '6 à 12 ans',
    tabs: ['life'],
    growth: { actionLabel: 'Jouer', counterLabel: 'Curiosité' },
    start: null,
  },
  {
    id: 'adolescence',
    fromAge: 13,
    sleepBaseHours: 9,
    name: 'Adolescence',
    ages: '13 à 17 ans',
    tabs: ['life'],
    growth: { actionLabel: 'Se chercher', counterLabel: 'Identité' },
    start: null,
  },
  {
    id: 'youth',
    fromAge: 18,
    sleepBaseHours: 8,
    name: 'Jeunesse',
    ages: '18 à 29 ans',
    tabs: gameTabIds,
    growth: null,
    start: null,
  },
  {
    id: 'adulthood',
    fromAge: 30,
    sleepBaseHours: 7,
    name: 'Âge adulte',
    ages: '30 à 49 ans',
    tabs: gameTabIds,
    growth: null,
    start: adulthoodStart,
  },
  {
    id: 'maturity',
    fromAge: 50,
    sleepBaseHours: 7,
    name: 'Maturité',
    ages: '50 à 64 ans',
    tabs: gameTabIds,
    growth: null,
    start: maturityStart,
  },
  {
    id: 'oldAge',
    fromAge: 65,
    sleepBaseHours: 6,
    name: 'Vieillesse',
    ages: '65 ans à la fin',
    tabs: gameTabIds,
    growth: null,
    start: oldAgeStart,
  },
];
