import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameContext } from '@context/GameContext';
import { screenPaths } from '@hook/useGameFlow';

// Ce que le joueur est en train de confirmer.
export type TitleConfirmation = 'start' | 'erase';

export const useTitleScreen = () => {
  const { hasSave, startGame, eraseSave } = useGameContext();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState<TitleConfirmation | null>(null);

  const start = useCallback(() => {
    startGame();
    void navigate(screenPaths.game);
  }, [startGame, navigate]);

  const confirm = useCallback(() => {
    if (confirming === 'start') {
      start();
    } else if (confirming === 'erase') {
      eraseSave();
    }
    setConfirming(null);
  }, [confirming, start, eraseSave]);

  return {
    hasSave,
    confirming,
    // Une vie déjà sauvegardée ne s'écrase pas sans confirmation.
    askStart: () => {
      if (hasSave) {
        setConfirming('start');
      } else {
        start();
      }
    },
    askErase: () => {
      setConfirming('erase');
    },
    confirm,
    cancel: () => {
      setConfirming(null);
    },
  };
};
