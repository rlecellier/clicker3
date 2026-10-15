import { useCallback, useEffect, useRef } from 'react';
import type { PressHandlers } from '@component/ActionButton';
import { LONG_PRESS_MS } from '@hook/useHoldRepeat';

// Délai pendant lequel le clic qui suit un appui long est ignoré. Au toucher,
// il arrive juste après `pointerup` puis `pointerleave`.
const CLICK_GRACE_MS = 400;

type Gesture = {
  // Appui court : l'action du bouton, une seule fois.
  onTap: () => void;
  // Appui long : une seule fois par appui, sans jouer l'action.
  onHold: () => void;
};

// Appui court = l'action, appui long = autre chose (un favori). Contrairement
// à `useHoldRepeat`, rien ne part à l'appui : l'action attend le relâchement,
// et un appui long ne la joue pas. Un seul hook sert toute une liste : `bind`
// donne, pour un bouton, ses gestes de conteneur (`press`) et son `onClick`.
export const useTapOrHold = () => {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const graceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // Un appui long vient d'agir : le clic qui suit le relâchement n'est pas un tap.
  const hasHeld = useRef(false);

  const stop = useCallback(() => {
    clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
  }, []);

  useEffect(
    () => () => {
      clearTimeout(holdTimer.current);
      clearTimeout(graceTimer.current);
    },
    [],
  );

  // Relâchement, sortie ou annulation : l'appui long n'aura pas lieu, et un
  // appui long déjà joué n'ignore plus le clic qu'un court instant.
  const end = useCallback(() => {
    stop();
    if (!hasHeld.current) {
      return;
    }
    clearTimeout(graceTimer.current);
    graceTimer.current = setTimeout(() => {
      hasHeld.current = false;
    }, CLICK_GRACE_MS);
  }, [stop]);

  const bind = useCallback(
    (gesture: Gesture) => {
      const press: PressHandlers = {
        onPointerDown: (event) => {
          stop();
          clearTimeout(graceTimer.current);
          hasHeld.current = false;
          if (event?.button !== undefined && event.button !== 0) {
            return;
          }
          holdTimer.current = setTimeout(() => {
            holdTimer.current = undefined;
            hasHeld.current = true;
            gesture.onHold();
          }, LONG_PRESS_MS);
        },
        onPointerUp: end,
        onPointerLeave: end,
        onPointerCancel: end,
        onKeyDown: () => {},
        // Un appui maintenu ne doit pas ouvrir le menu contextuel du navigateur.
        onContextMenu: (event) => {
          event.preventDefault();
        },
      };
      const onClick = () => {
        if (hasHeld.current) {
          hasHeld.current = false;
          return;
        }
        gesture.onTap();
      };
      return { press, onClick };
    },
    [stop, end],
  );

  return bind;
};
