import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGameContext } from '@context/GameContext';
import { birthSituations, lifeSlices } from '@game/data';
import type { LifeSliceId } from '@game/state';
import { screenPaths } from '@hook/useGameFlow';

// Effacer la sauvegarde se confirme ici, de même que commencer une autre
// tranche de vie par-dessus une vie en cours. Démarrer Jeunesse mène au choix
// du premier emploi, où l'écrasement est confirmé.
export type TitleConfirmation = 'erase' | 'restart';

// Les tranches de vie qui démarrent directement sur l'écran de jeu : toutes
// sauf Jeunesse, qui passe par le choix du premier emploi.
const otherSlices = lifeSlices.filter(({ id }) => id !== 'youth');

// Les tranches où le joueur choisit sa situation de naissance avant de jouer ;
// les autres gardent la situation par défaut (`medium`).
const birthChoiceSlices = new Set<LifeSliceId>(['earlyChildhood']);

type PendingStart = { lifeSlice: LifeSliceId; birthSituation?: string };

export const useTitleScreen = () => {
  const { state, hasSave, eraseSave, startGame } = useGameContext();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState<TitleConfirmation | null>(null);
  const [pending, setPending] = useState<PendingStart | null>(null);
  // La tranche dont on choisit la situation de naissance, ou `null`.
  const [choosing, setChoosing] = useState<LifeSliceId | null>(null);
  const isReplacingLife = hasSave && state.status === 'playing';

  const begin = useCallback(
    ({ lifeSlice, birthSituation }: PendingStart) => {
      startGame(undefined, lifeSlice, birthSituation);
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

  // Lance la vie, après confirmation si elle en écrase une en cours.
  const launch = useCallback(
    (start: PendingStart) => {
      setChoosing(null);
      if (isReplacingLife) {
        setPending(start);
        setConfirming('restart');
      } else {
        begin(start);
      }
    },
    [isReplacingLife, begin],
  );

  return {
    hasSave,
    confirming,
    slices: otherSlices.map(({ id, name, ages }) => ({
      id,
      label: `${name} (${ages})`,
      start: () => {
        if (birthChoiceSlices.has(id)) {
          setChoosing(id);
        } else {
          launch({ lifeSlice: id });
        }
      },
    })),
    // Le choix de la situation de naissance, quand une tranche le demande.
    birthChoice:
      choosing === null
        ? null
        : birthSituations.map(({ id, name, description }) => ({
            id,
            name,
            description,
            start: () => {
              launch({ lifeSlice: choosing, birthSituation: id });
            },
          })),
    askErase: () => {
      setConfirming('erase');
    },
    confirm,
    cancel: () => {
      setConfirming(null);
      setPending(null);
      setChoosing(null);
    },
  };
};
