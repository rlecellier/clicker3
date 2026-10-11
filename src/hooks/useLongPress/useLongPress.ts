import { useCallback, useEffect, useRef } from 'react';

// Durée d'appui à partir de laquelle un appui devient « long ». À ajuster
// après essais en jeu.
export const LONG_PRESS_MS = 500;

// Appui long sur un bouton : `onLongPress` se déclenche une fois la durée
// atteinte, et le clic qui suit le relâchement est alors ignoré. Sans
// `onLongPress`, le bouton se comporte comme un bouton ordinaire.
export const useLongPress = (
  onClick: () => void,
  onLongPress?: () => void,
  delayMs = LONG_PRESS_MS,
) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFired = useRef(false);

  const cancel = useCallback(() => {
    if (timer.current === null) {
      return;
    }
    clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const start = useCallback(() => {
    cancel();
    hasFired.current = false;
    if (onLongPress === undefined) {
      return;
    }

    timer.current = setTimeout(() => {
      timer.current = null;
      hasFired.current = true;
      onLongPress();
    }, delayMs);
  }, [cancel, onLongPress, delayMs]);

  const click = useCallback(() => {
    if (hasFired.current) {
      hasFired.current = false;
      return;
    }
    onClick();
  }, [onClick]);

  return {
    onClick: click,
    // Un appui long ne doit pas ouvrir le menu contextuel du navigateur.
    press: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (event: { preventDefault: () => void }) => {
        if (onLongPress !== undefined) {
          event.preventDefault();
        }
      },
    },
  };
};
