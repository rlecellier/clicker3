import { useCallback, useEffect, useRef } from 'react';

// Délai pendant lequel une fenêtre qui vient de s'ouvrir ignore les appuis.
export const EARLY_TAP_MS = 400;

// Au toucher, le `click` d'un appui part après le relâchement, sur ce qui se
// trouve alors sous le doigt : si l'appui a ouvert une fenêtre, il tombe sur
// son premier bouton et répond à sa place. `guard` enveloppe l'action d'un
// bouton de la fenêtre : tant que `key` (la fenêtre ouverte) a moins de
// `EARLY_TAP_MS`, elle ne fait rien.
export const useIgnoreEarlyTaps = (key: string | null) => {
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, [key]);
  return useCallback(
    (action: () => void) => () => {
      if (Date.now() - openedAt.current >= EARLY_TAP_MS) {
        action();
      }
    },
    [],
  );
};
