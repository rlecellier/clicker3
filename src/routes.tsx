import { createBrowserRouter, Outlet } from 'react-router';
import { GameProvider } from '@context/GameContext';
import { AbsencePage } from '@page/AbsencePage';
import { CityPage } from '@page/CityPage';
import { EndPage } from '@page/EndPage';
import { GamePage } from '@page/GamePage';
import { NewLifePage } from '@page/NewLifePage';
import { ScreenGuard } from '@page/ScreenGuard';
import { StyleguidePage } from '@page/StyleguidePage';
import { TitlePage } from '@page/TitlePage';

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
            { path: '/jeu', element: <GamePage /> },
            { path: '/ville', element: <CityPage /> },
          ],
        },
      ],
    },
    ...developmentRoutes,
  ],
  { basename: import.meta.env.BASE_URL },
);
