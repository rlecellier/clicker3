import { useCallback, useEffect, useRef } from 'react';

// Durée d'appui à partir de laquelle un appui devient « long » (bascule de
// l'automatique). À ajuster après essais en jeu.
export const LONG_PRESS_MS = 500;

// Cadence de la répétition doigt posé : 4 clics par seconde.
export const HOLD_REPEAT_MS = 250;

// Délai pendant lequel le clic natif qui suit un relâchement est ignoré. Sur
// écran tactile, ce clic arrive juste après `pointerup` (et `pointerleave`).
const CLICK_GRACE_MS = 400;

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
  const isDown = useRef(false);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
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
    return () => {
      stop();
      clearTimeout(graceTimer.current);
    };
  }, [isDisabled, stop]);

  const hasLongPress = onLongPress !== undefined;

  const start = useCallback(
    (event?: { button?: number }) => {
      stop();
      clearTimeout(graceTimer.current);
      hasActed.current = false;
      isDown.current = false;
      if (isDisabled || (event?.button !== undefined && event.button !== 0)) {
        return;
      }
      hasActed.current = true;
      isDown.current = true;
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

  // Relâchement : le clic natif qui suit est ignoré, mais pas indéfiniment
  // (le clavier doit rester un clic ordinaire).
  const release = useCallback(() => {
    stop();
    if (!isDown.current) {
      return;
    }
    isDown.current = false;
    clearTimeout(graceTimer.current);
    graceTimer.current = setTimeout(() => {
      hasActed.current = false;
    }, CLICK_GRACE_MS);
  }, [stop]);

  // Annulation, ou sortie doigt posé : aucun clic natif ne suivra. Sur écran
  // tactile, `pointerleave` suit `pointerup` : après un relâchement, il ne
  // doit pas faire oublier que l'appui a déjà agi.
  const abort = useCallback(() => {
    stop();
    if (!isDown.current) {
      return;
    }
    isDown.current = false;
    hasActed.current = false;
  }, [stop]);
  const leave = abort;

  const click = useCallback(() => {
    if (hasActed.current) {
      hasActed.current = false;
      return;
    }
    latest.current.onClick();
  }, []);

  const press: PressHandlers = {
    onPointerDown: start,
    onPointerUp: release,
    onPointerLeave: leave,
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
