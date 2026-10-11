import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { GameProvider } from '@context/GameContext';
import { DEFAULT_TAB_SLUG, gamePath } from '@hook/useGameTabs';
import { AbsencePage } from '@page/AbsencePage';
import { AccountsPage } from '@page/AccountsPage';
import { CityPage } from '@page/CityPage';
import { EndPage } from '@page/EndPage';
import { GamePage } from '@page/GamePage';
import { InvestPage } from '@page/InvestPage';
import { JobsPage } from '@page/JobsPage';
import { LifePage } from '@page/LifePage';
import { MailPage } from '@page/MailPage';
import { NewLifePage } from '@page/NewLifePage';
import { ScreenGuard } from '@page/ScreenGuard';
import { SkillsPage } from '@page/SkillsPage';
import { StyleguidePage } from '@page/StyleguidePage';
import { TitlePage } from '@page/TitlePage';

const toDefaultTab = <Navigate to={gamePath(DEFAULT_TAB_SLUG)} replace />;

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
                { path: 'courrier', element: <MailPage /> },
                { path: 'vie', element: <LifePage /> },
                { path: 'competences', element: <SkillsPage /> },
                { path: 'emploi', element: <JobsPage /> },
                { path: 'investir', element: <InvestPage /> },
                { path: 'comptes', element: <AccountsPage /> },
                { path: 'ville', element: <CityPage /> },
                // Onglet inconnu : retour à l'onglet par défaut.
                { path: '*', element: toDefaultTab },
              ],
            },
            // Ancien lien vers le plan de la ville.
            {
              path: '/ville',
              element: <Navigate to={gamePath('ville')} replace />,
            },
          ],
        },
      ],
    },
    ...developmentRoutes,
  ],
  { basename: import.meta.env.BASE_URL },
);
