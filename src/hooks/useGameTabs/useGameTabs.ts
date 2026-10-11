import { useGameContext } from '@context/GameContext';
import { unreadMail } from '@game/mail';
import { newItems, noveltyTabs } from '@game/novelty';
import type { NoveltyTab } from '@game/novelty';
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
  `${gamePath('investir')}?${UPGRADE_PARAM}=${encodeURIComponent(upgradeId)}`;

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
    tabs: gameTabs.map((tab) => {
      const item = { id: tab.id, label: tab.label, to: gamePath(tab.slug) };
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
