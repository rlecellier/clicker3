import { useCallback, useState } from 'react';
import { useGameContext } from '@context/GameContext';

// Seul l'effacement se confirme ici : démarrer une vie mène au choix du
// premier emploi, où l'écrasement d'une vie en cours est confirmé.
export type TitleConfirmation = 'erase';

export const useTitleScreen = () => {
  const { hasSave, eraseSave } = useGameContext();
  const [confirming, setConfirming] = useState<TitleConfirmation | null>(null);

  const confirm = useCallback(() => {
    if (confirming === 'erase') {
      eraseSave();
    }
    setConfirming(null);
  }, [confirming, eraseSave]);

  return {
    hasSave,
    confirming,
    askErase: () => {
      setConfirming('erase');
    },
    confirm,
    cancel: () => {
      setConfirming(null);
    },
  };
};
