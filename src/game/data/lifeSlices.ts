import type { LifeSliceId } from '@game/state';

export type LifeSlice = {
  id: LifeSliceId;
  name: string;
  ages: string;
  // Onglets de l'écran de jeu proposés dans cette tranche, dans l'ordre de la sidebar.
  tabs: readonly string[];
  // Tranche avant 18 ans : un seul bouton d'action qui fait monter un compteur.
  // `null` pour Jeunesse, qui a toutes ses règles.
  growth: { actionLabel: string; counterLabel: string } | null;
};

// Dans l'ordre de la vie. Jeunesse couvre pour l'instant tout ce qui suit
// l'adolescence (âge adulte, maturité, vieillesse).
export const lifeSlices: readonly LifeSlice[] = [
  {
    id: 'earlyChildhood',
    name: 'Petite enfance',
    ages: '0 à 5 ans',
    tabs: ['life'],
    growth: { actionLabel: 'Gazouiller', counterLabel: 'Éveil' },
  },
  {
    id: 'childhood',
    name: 'Enfance',
    ages: '6 à 12 ans',
    tabs: ['life'],
    growth: { actionLabel: 'Jouer', counterLabel: 'Curiosité' },
  },
  {
    id: 'adolescence',
    name: 'Adolescence',
    ages: '13 à 17 ans',
    tabs: ['life'],
    growth: { actionLabel: 'Se chercher', counterLabel: 'Identité' },
  },
  {
    id: 'youth',
    name: 'Jeunesse',
    ages: '18 ans à la fin',
    tabs: [
      'mail',
      'life',
      'profile',
      'jobs',
      'companies',
      'upgrades',
      'accounts',
      'finance',
      'city',
    ],
    growth: null,
  },
];
