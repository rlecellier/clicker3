import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { jobs } from '@game/data';
import { checkRequirement, formatCount, formatMoney } from '@game/format';
import { canChangeJob } from '@game/jobs';
import { canSpendReputation } from '@game/reputation';
import { useGameActions } from '@hook/useGameActions';

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
    const hasMissing = conditions?.some((condition) => !condition.isMet);
    const isShortOnReputation = !canSpendReputation(state, candidate.cost);
    const reason =
      !isCurrent && hasMissing !== true && isShortOnReputation
        ? 'Réputation insuffisante'
        : undefined;
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
      reason,
      conditions,
      onAction: () => {
        actions.changeJob(candidate.id);
      },
    };
  });

  return { jobs: jobItems };
};
