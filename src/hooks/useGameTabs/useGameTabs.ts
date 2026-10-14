import { useGameContext } from '@context/GameContext';
import { sliceTabs } from '@game/lifeSlices';
import { findById } from '@game/data';
import { unreadMail } from '@game/mail';
import { newItems, noveltyTabs } from '@game/novelty';
import { openablePlacements } from '@game/placements';
import type { NoveltyTab } from '@game/novelty';
import { screenPaths } from '@hook/useGameFlow';

export type GameTabId =
  | 'mail'
  | 'life'
  | 'profile'
  | 'jobs'
  | 'companies'
  | 'upgrades'
  | 'accounts'
  | 'finance'
  | 'city';

export type GameTab = { id: GameTabId; label: string; slug: string };

// Ordre de la sidebar ; les slugs sont les routes `/jeu/<slug>` (ADR 0008).
// Seul endroit où un slug est écrit : le reste passe par `tabPath(id)`.
export const gameTabs: readonly GameTab[] = [
  { id: 'mail', label: 'Courrier', slug: 'courrier' },
  { id: 'life', label: 'Vie', slug: 'vie' },
  { id: 'profile', label: 'Profil', slug: 'profil' },
  { id: 'jobs', label: 'Emploi', slug: 'emploi' },
  { id: 'companies', label: 'Entreprises', slug: 'entreprises' },
  { id: 'upgrades', label: 'Améliorations', slug: 'ameliorations' },
  { id: 'accounts', label: 'Comptes', slug: 'comptes' },
  { id: 'finance', label: 'Finance', slug: 'finance' },
  { id: 'city', label: 'Ville', slug: 'ville' },
];

// Touche qui ouvre l'onglet de ce rang (1 à 9), dans l'ordre de la sidebar.
export const tabShortcut = (index: number) => String(index + 1);

export const DEFAULT_TAB: GameTabId = 'life';

const slugOf = (id: GameTabId) => findById(gameTabs, id)?.slug ?? '';

// Route d'un onglet de l'écran de jeu (`/jeu/<slug>`).
export const tabPath = (id: GameTabId) => `${screenPaths.game}/${slugOf(id)}`;

// Ancres des sections de Comptes visées depuis la balance de la période.
export type AccountsSection = 'money' | 'stock';

export const accountsSectionIds: Record<AccountsSection, string> = {
  money: 'argent',
  stock: 'stock',
};

// Comptes, ouvert sur le récap de l'argent ou du stock.
export const accountsPath = (section: AccountsSection) =>
  `${tabPath('accounts')}#${accountsSectionIds[section]}`;

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

// Paramètre d'URL qui désigne l'amélioration visée dans Améliorations.
export const UPGRADE_PARAM = 'amelioration';

export const upgradePath = (upgradeId: string) =>
  `${tabPath('upgrades')}?${UPGRADE_PARAM}=${encodeURIComponent(upgradeId)}`;

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
  const openTabs = sliceTabs(state);
  return {
    // Les touches 1 à 9 restent celles de la liste complète : un onglet fermé
    // dans la tranche ne décale pas les autres.
    tabs: gameTabs
      .map((tab, index) => ({ tab, index }))
      .filter(({ tab }) => openTabs.includes(tab.id))
      .map(({ tab, index }) => {
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
        if (tab.id === 'finance') {
          // Comptes à ouvrir : rendez-vous chez le banquier.
          const count = openablePlacements(state).length;
          return {
            ...item,
            badge: countBadge(count),
            badgeTone: 'info' as const,
            accessibleLabel: noveltyLabel(tab.label, count),
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
      // Le choix du premier emploi n'existe qu'en Jeunesse.
      to: state.lifeSlice === 'youth' ? screenPaths.newLife : screenPaths.title,
    },
  };
};
