import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { screenPaths, useGameFlow } from '@hook/useGameFlow';
import type { GameScreen } from '@hook/useGameFlow';

type ScreenGuardProperties = { screen: GameScreen; children: ReactNode };

// Ne montre ses enfants que si la partie est à cet écran ; sinon, redirige
// vers l'écran où elle se trouve (titre, absence, fin ou jeu).
export const ScreenGuard = ({ screen, children }: ScreenGuardProperties) => {
  const current = useGameFlow();
  return current === screen ? (
    children
  ) : (
    <Navigate to={screenPaths[current]} replace />
  );
};
