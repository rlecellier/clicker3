import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { formatMoney } from '@game/format';
import { startingJobs } from '@game/jobs';
import { screenPaths } from '@hook/useGameFlow';

// Début de partie : le joueur prend son premier emploi. Recommencer une vie
// encore en cours l'écrase, donc le choix demande d'abord confirmation.
export const useNewLifeScreen = () => {
  const { state, hasSave, startGame } = useGameContext();
  const navigate = useNavigate();
  const [pending, setPending] = useState<string | null>(null);
  const isReplacingLife = hasSave && state.status === 'playing';

  const begin = useCallback(
    (jobId: string) => {
      startGame(jobId);
      void navigate(screenPaths.game);
    },
    [startGame, navigate],
  );

  const choose = useCallback(
    (jobId: string) => {
      if (isReplacingLife) {
        setPending(jobId);
      } else {
        begin(jobId);
      }
    },
    [isReplacingLife, begin],
  );

  const jobs: ListItem[] = startingJobs.map((job) => ({
    id: job.id,
    title: job.name,
    detail: `Salaire : ${formatMoney(job.salary)} par action`,
    actionLabel: 'Prendre ce poste',
    isDisabled: false,
    onAction: () => {
      choose(job.id);
    },
  }));

  return {
    jobs,
    isConfirming: pending !== null,
    confirm: () => {
      if (pending !== null) {
        begin(pending);
      }
      setPending(null);
    },
    cancel: () => {
      setPending(null);
    },
  };
};
