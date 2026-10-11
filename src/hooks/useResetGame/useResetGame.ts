import { useCallback, useState } from 'react';
import { useGameContext } from '@context/GameContext';

// Recommencer la partie en cours : le joueur confirme avant que la vie en
// cours ne soit remplacée par une vie neuve.
export const useResetGame = () => {
  const { startGame } = useGameContext();
  const [isConfirming, setConfirming] = useState(false);

  const ask = useCallback(() => {
    setConfirming(true);
  }, []);
  const cancel = useCallback(() => {
    setConfirming(false);
  }, []);
  const confirm = useCallback(() => {
    startGame();
    setConfirming(false);
  }, [startGame]);

  return { isConfirming, ask, confirm, cancel };
};
