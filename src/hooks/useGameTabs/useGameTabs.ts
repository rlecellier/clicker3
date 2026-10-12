import { useGameContext } from '@context/GameContext';
import { findById } from '@game/data';
import { unreadMail } from '@game/mail';
import { newItems, noveltyTabs } from '@game/novelty';
import type { NoveltyTab } from '@game/novelty';
import { screenPaths } from '@hook/useGameFlow';

export type GameTabId =
  'mail' | 'life' | 'skills' | 'jobs' | 'invest' | 'accounts' | 'city';

export type GameTab = { id: GameTabId; label: string; slug: string };

// Ordre de la sidebar ; les slugs sont les routes `/jeu/<slug>` (ADR 0008).
// Seul endroit où un slug est écrit : le reste passe par `tabPath(id)`.
export const gameTabs: readonly GameTab[] = [
  { id: 'mail', label: 'Courrier', slug: 'courrier' },
  { id: 'life', label: 'Vie', slug: 'vie' },
  { id: 'skills', label: 'Compétences', slug: 'competences' },
  { id: 'jobs', label: 'Emploi', slug: 'emploi' },
  { id: 'invest', label: 'Investir', slug: 'investir' },
  { id: 'accounts', label: 'Comptes', slug: 'comptes' },
  { id: 'city', label: 'Ville', slug: 'ville' },
];

// Touche qui ouvre l'onglet de ce rang (1 à 7), dans l'ordre de la sidebar.
export const tabShortcut = (index: number) => String(index + 1);

export const DEFAULT_TAB: GameTabId = 'life';

const slugOf = (id: GameTabId) => findById(gameTabs, id)?.slug ?? '';

// Route d'un onglet de l'écran de jeu (`/jeu/<slug>`).
export const tabPath = (id: GameTabId) => `${screenPaths.game}/${slugOf(id)}`;

const maxBadge = 99;

// Pastille du courrier : cachée à zéro, « 99+ » au-delà de 99.
const countBadge = (unread: number) =>
  unread > maxBadge ? `${maxBadge}+` : unread;

const mailLabel = (unread: number) => {
  if (unread === 0) {
    return 'Courrier';
  }
  const count = unread > maxBadge ? `Plus de ${maxBadge}` : String(unread);
  return `Courrier, ${count} ${unread === 1 ? 'message non lu' : 'messages non lus'}`;
};

// Paramètre d'URL qui désigne l'amélioration visée dans Investir.
export const UPGRADE_PARAM = 'amelioration';

export const upgradePath = (upgradeId: string) =>
  `${tabPath('invest')}?${UPGRADE_PARAM}=${encodeURIComponent(upgradeId)}`;

const isNoveltyTab = (id: GameTabId): id is NoveltyTab =>
  (noveltyTabs as readonly string[]).includes(id);

const noveltyLabel = (label: string, count: number) =>
  count === 0
    ? label
    : `${label}, ${count} ${count === 1 ? 'nouveauté' : 'nouveautés'}`;

// Onglets de la sidebar et lien « Recommencer », prêts à afficher (sans icône).
export const useGameTabs = () => {
  const { state } = useGameContext();
  const unread = unreadMail(state);
  return {
    tabs: gameTabs.map((tab, index) => {
      const item = {
        id: tab.id,
        label: tab.label,
        to: tabPath(tab.id),
        shortcut: tabShortcut(index),
      };
      if (tab.id === 'mail') {
        return {
          ...item,
          badge: countBadge(unread),
          badgeTone: 'alert' as const,
          accessibleLabel: mailLabel(unread),
        };
      }
      if (isNoveltyTab(tab.id)) {
        const count = newItems(state, tab.id).length;
        return {
          ...item,
          badge: countBadge(count),
          badgeTone: 'info' as const,
          accessibleLabel: noveltyLabel(tab.label, count),
        };
      }
      return item;
    }),
    footer: {
      id: 'new-life',
      label: 'Recommencer',
      to: screenPaths.newLife,
    },
  };
};
