import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { GameProvider } from '@context/GameContext';
import { DEFAULT_TAB, gameTabs, tabPath } from '@hook/useGameTabs';
import type { GameTabId } from '@hook/useGameTabs';
import { AbsencePage } from '@page/AbsencePage';
import { AccountsPage } from '@page/AccountsPage';
import { CompaniesPage } from '@page/CompaniesPage';
import { CityPage } from '@page/CityPage';
import { EndPage } from '@page/EndPage';
import { FinancePage } from '@page/FinancePage';
import { GamePage } from '@page/GamePage';
import { JobsPage } from '@page/JobsPage';
import { LifeTabPage } from '@page/LifeTabPage';
import { MailPage } from '@page/MailPage';
import { NewLifePage } from '@page/NewLifePage';
import { ProfilePage } from '@page/ProfilePage';
import { ScreenGuard } from '@page/ScreenGuard';
import { TabGuard } from '@page/TabGuard';
import { StyleguidePage } from '@page/StyleguidePage';
import { TitlePage } from '@page/TitlePage';
import { UpgradesPage } from '@page/UpgradesPage';

const toDefaultTab = <Navigate to={tabPath(DEFAULT_TAB)} replace />;

// La page de chaque onglet : un onglet sans page ne compile pas.
const tabPages: Record<GameTabId, ReactNode> = {
  mail: <MailPage />,
  life: <LifeTabPage />,
  profile: <ProfilePage />,
  jobs: <JobsPage />,
  companies: <CompaniesPage />,
  upgrades: <UpgradesPage />,
  accounts: <AccountsPage />,
  finance: <FinancePage />,
  city: <CityPage />,
};

// Une route `/jeu/<slug>` par onglet, dans l'ordre de la sidebar.
const tabRoutes = gameTabs.map((tab) => ({
  path: tab.slug,
  element: <TabGuard tab={tab.id}>{tabPages[tab.id]}</TabGuard>,
}));

// `/styleguide` n'existe qu'en développement.
const developmentRoutes = import.meta.env.DEV
  ? [{ path: '/styleguide', element: <StyleguidePage /> }]
  : [];

export const router = createBrowserRouter(
  [
    {
      // Un seul provider : tous les écrans partagent la même partie.
      element: (
        <GameProvider>
          <Outlet />
        </GameProvider>
      ),
      children: [
        { path: '/', element: <TitlePage /> },
        { path: '/nouvelle-vie', element: <NewLifePage /> },
        {
          path: '/absence',
          element: (
            <ScreenGuard screen="absence">
              <AbsencePage />
            </ScreenGuard>
          ),
        },
        {
          path: '/fin',
          element: (
            <ScreenGuard screen="end">
              <EndPage />
            </ScreenGuard>
          ),
        },
        {
          element: (
            <ScreenGuard screen="game">
              <Outlet />
            </ScreenGuard>
          ),
          children: [
            {
              path: '/jeu',
              element: <GamePage />,
              children: [
                { index: true, element: toDefaultTab },
                ...tabRoutes,
                // Onglet inconnu : retour à l'onglet par défaut.
                { path: '*', element: toDefaultTab },
              ],
            },
            // Ancien lien vers le plan de la ville.
            {
              path: '/ville',
              element: <Navigate to={tabPath('city')} replace />,
            },
          ],
        },
      ],
    },
    ...developmentRoutes,
  ],
  { basename: import.meta.env.BASE_URL },
);
