import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { jobs } from '@game/data';
import { checkRequirement, formatCount, formatMoney } from '@game/format';
import { canChangeJob } from '@game/jobs';
import { useGameActions } from '@hook/useGameActions';
import { NO_REPUTATION, unavailableReason } from '@view/purchase';

// Onglet Emploi : les postes, l'actuel en tête de badge, chacun avec ses
// conditions et la réputation à payer.
export const useJobsScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();

  const jobItems: ListItem[] = jobs.map((candidate) => {
    const isCurrent = candidate.id === state.jobId;
    const conditions =
      isCurrent || candidate.requirement === undefined
        ? undefined
        : checkRequirement(state, candidate.requirement);
    return {
      id: candidate.id,
      title: candidate.name,
      detail: `Salaire ${formatMoney(candidate.salary)}${
        candidate.cost > 0
          ? ` · ${formatCount(candidate.cost)} de réputation`
          : ''
      }`,
      badge: isCurrent ? 'Actuel' : undefined,
      actionLabel: 'Prendre',
      isDisabled: !canChangeJob(state, candidate.id),
      reason: unavailableReason(state, {
        isDone: isCurrent,
        requirement: candidate.requirement,
        shortage: NO_REPUTATION,
      }),
      conditions,
      onAction: () => {
        actions.changeJob(candidate.id);
      },
    };
  });

  return { jobs: jobItems };
};
