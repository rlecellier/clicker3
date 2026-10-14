import { useGameTabs } from '@hook/useGameTabs';
import type { GameTabId } from '@hook/useGameTabs';
import { useIsCompact } from '@hook/useIsCompact';
import { useStartMenu } from '@hook/useStartMenu';

// Onglets épinglés dans la barre des tâches ; les autres sont dans le menu
// Démarrer (ADR 0008).
// La Maison et les Relations n'existent qu'avant 18 ans : on les épingle.
const pinnedTabIds = new Set<GameTabId>([
  'mail',
  'life',
  'jobs',
  'companies',
  'house',
  'relations',
]);

const startLabel = 'Démarrer';

type Badged = { badge?: number | string; id: string };

const hasBadge = (tab: Badged) => tab.badge !== undefined && tab.badge !== 0;

const startAccessibleLabel = (count: number) =>
  count === 0
    ? startLabel
    : `${startLabel}, ${count} ${count === 1 ? 'onglet à consulter' : 'onglets à consulter'}`;

// Navigation de l'écran de jeu : sidebar au-dessus de 40 rem, sinon barre des
// tâches (onglets épinglés) et menu Démarrer (tous les onglets).
export const useGameNavigation = () => {
  const { tabs, footer } = useGameTabs();
  const isCompact = useIsCompact();
  const menu = useStartMenu();
  const pinned = tabs.filter((tab) => pinnedTabIds.has(tab.id));
  const flaggedCount = tabs.filter(
    (tab) => !pinnedTabIds.has(tab.id) && hasBadge(tab),
  ).length;
  return {
    isCompact,
    tabs,
    footer,
    pinned,
    start: {
      label: startLabel,
      accessibleLabel: startAccessibleLabel(flaggedCount),
      badge: flaggedCount,
      isOpen: menu.isOpen,
      onToggle: menu.toggle,
    },
    closeMenu: menu.close,
  };
};
