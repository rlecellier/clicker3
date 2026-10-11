import { useCallback, useEffect, useRef } from 'react';

// Durée d'appui à partir de laquelle un appui devient « long » (bascule de
// l'automatique). À ajuster après essais en jeu.
export const LONG_PRESS_MS = 500;

// Cadence de la répétition doigt posé : 4 clics par seconde.
export const HOLD_REPEAT_MS = 250;

// Gestes à poser sur le conteneur du bouton.
export type PressHandlers = {
  onPointerDown: (event?: { button?: number }) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onKeyDown: (event: {
    key: string;
    repeat: boolean;
    preventDefault: () => void;
  }) => void;
  onContextMenu: (event: { preventDefault: () => void }) => void;
};

type HoldRepeatOptions = {
  onClick: () => void;
  // Appui long : se déclenche une seule fois par appui, sans arrêter la
  // répétition. Sans lui, le bouton ne fait que répéter.
  onLongPress?: () => void;
  isDisabled?: boolean;
};

// Bouton d'action maintenu : un clic part à l'appui, puis un toutes les
// `HOLD_REPEAT_MS` tant que le doigt reste posé. Au bout de `LONG_PRESS_MS`,
// `onLongPress` se déclenche une fois. Le clic natif qui suit le relâchement
// est ignoré (l'appui a déjà agi). Le clavier ne répète jamais.
export const useHoldRepeat = ({
  onClick,
  onLongPress,
  isDisabled = false,
}: HoldRepeatOptions) => {
  const repeatTimer = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const longTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const hasActed = useRef(false);
  // Les minuteurs lisent toujours la dernière version des actions.
  const latest = useRef({ onClick, onLongPress });
  useEffect(() => {
    latest.current = { onClick, onLongPress };
  });

  const stop = useCallback(() => {
    clearInterval(repeatTimer.current);
    clearTimeout(longTimer.current);
    repeatTimer.current = undefined;
    longTimer.current = undefined;
  }, []);

  // Démontage ou bouton indisponible : plus aucune répétition.
  useEffect(() => {
    if (isDisabled) {
      stop();
    }
    return stop;
  }, [isDisabled, stop]);

  const hasLongPress = onLongPress !== undefined;

  const start = useCallback(
    (event?: { button?: number }) => {
      stop();
      hasActed.current = false;
      if (isDisabled || (event?.button !== undefined && event.button !== 0)) {
        return;
      }
      hasActed.current = true;
      latest.current.onClick();
      repeatTimer.current = setInterval(() => {
        latest.current.onClick();
      }, HOLD_REPEAT_MS);
      if (hasLongPress) {
        longTimer.current = setTimeout(() => {
          longTimer.current = undefined;
          latest.current.onLongPress?.();
        }, LONG_PRESS_MS);
      }
    },
    [stop, isDisabled, hasLongPress],
  );

  // Sortie ou annulation : aucun clic natif ne suivra.
  const abort = useCallback(() => {
    stop();
    hasActed.current = false;
  }, [stop]);

  const click = useCallback(() => {
    if (hasActed.current) {
      hasActed.current = false;
      return;
    }
    latest.current.onClick();
  }, []);

  const press: PressHandlers = {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: abort,
    onPointerCancel: abort,
    // Entrée maintenue relance sinon le clic natif : le clavier ne répète pas.
    onKeyDown: (event) => {
      if (event.repeat && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
      }
    },
    // Un appui maintenu ne doit pas ouvrir le menu contextuel du navigateur.
    onContextMenu: (event) => {
      event.preventDefault();
    },
  };

  return { onClick: click, press };
};
