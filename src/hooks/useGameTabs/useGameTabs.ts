import { screenPaths } from '@hook/useGameFlow';

export type GameTabId =
  'mail' | 'life' | 'skills' | 'jobs' | 'invest' | 'accounts' | 'city';

export type GameTab = { id: GameTabId; label: string; slug: string };

// Ordre de la sidebar ; les slugs sont les routes `/jeu/<slug>` (ADR 0008).
export const gameTabs: readonly GameTab[] = [
  { id: 'mail', label: 'Courrier', slug: 'courrier' },
  { id: 'life', label: 'Vie', slug: 'vie' },
  { id: 'skills', label: 'Compétences', slug: 'competences' },
  { id: 'jobs', label: 'Emploi', slug: 'emploi' },
  { id: 'invest', label: 'Investir', slug: 'investir' },
  { id: 'accounts', label: 'Comptes', slug: 'comptes' },
  { id: 'city', label: 'Ville', slug: 'ville' },
];

export const DEFAULT_TAB_SLUG = 'vie';

export const gamePath = (slug: string) => `${screenPaths.game}/${slug}`;

// Onglets de la sidebar et lien « Recommencer », prêts à afficher (sans icône).
export const useGameTabs = () => ({
  tabs: gameTabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    to: gamePath(tab.slug),
  })),
  footer: {
    id: 'new-life',
    label: 'Recommencer',
    to: screenPaths.newLife,
  },
});
