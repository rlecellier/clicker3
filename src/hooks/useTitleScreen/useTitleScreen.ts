import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameContext } from '@context/GameContext';
import { lifeSlices } from '@game/data';
import type { LifeSliceId } from '@game/state';
import { screenPaths } from '@hook/useGameFlow';

// Effacer la sauvegarde se confirme ici, de même que commencer une tranche
// avant 18 ans par-dessus une vie en cours. Démarrer Jeunesse mène au choix du
// premier emploi, où l'écrasement est confirmé.
export type TitleConfirmation = 'erase' | 'restart';

// Les tranches de vie qui démarrent directement sur l'écran de jeu.
const earlySlices = lifeSlices.filter(({ growth }) => growth !== null);

export const useTitleScreen = () => {
  const { state, hasSave, eraseSave, startGame } = useGameContext();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState<TitleConfirmation | null>(null);
  const [pending, setPending] = useState<LifeSliceId | null>(null);
  const isReplacingLife = hasSave && state.status === 'playing';

  const begin = useCallback(
    (lifeSlice: LifeSliceId) => {
      startGame(undefined, lifeSlice);
      void navigate(screenPaths.game);
    },
    [startGame, navigate],
  );

  const confirm = useCallback(() => {
    if (confirming === 'erase') {
      eraseSave();
    }
    if (confirming === 'restart' && pending !== null) {
      begin(pending);
    }
    setConfirming(null);
    setPending(null);
  }, [confirming, pending, eraseSave, begin]);

  return {
    hasSave,
    confirming,
    slices: earlySlices.map(({ id, name, ages }) => ({
      id,
      label: `${name} (${ages})`,
      start: () => {
        if (isReplacingLife) {
          setPending(id);
          setConfirming('restart');
        } else {
          begin(id);
        }
      },
    })),
    askErase: () => {
      setConfirming('erase');
    },
    confirm,
    cancel: () => {
      setConfirming(null);
      setPending(null);
    },
  };
};
