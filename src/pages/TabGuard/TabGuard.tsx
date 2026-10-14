import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { DEFAULT_TAB, tabPath } from '@hook/useGameTabs';
import type { GameTabId } from '@hook/useGameTabs';
import { useLifeSlice } from '@hook/useLifeSlice';

type TabGuardProperties = { tab: GameTabId; children: ReactNode };

// Ne montre la page d'un onglet que si la tranche de vie le propose ; sinon,
// retour à l'onglet par défaut.
export const TabGuard = ({ tab, children }: TabGuardProperties) => {
  const { tabs } = useLifeSlice();
  return tabs.includes(tab) ? (
    children
  ) : (
    <Navigate to={tabPath(DEFAULT_TAB)} replace />
  );
};
