import { useGameContext } from '@context/GameContext';
import { formatCount, formatDecimal, statLabels } from '@game/format';
import { reputationTierProgress } from '@game/reputation';
import { statIds } from '@game/state';
import { statProgress } from '@game/stats';

// Onglet Compétences : une barre par stat, puis la réputation au même format
// (son palier se calcule sur le cumul gagné).
export const useSkillsScreen = () => {
  const { state } = useGameContext();

  const skillBars = statIds.map((id) => {
    const progress = statProgress(state, id);
    return {
      id,
      label: `${statLabels[id]} · palier ${progress.tier} · ${progress.isMax ? 'max' : `${formatCount(progress.points)} pts`}`,
      value: progress.value,
      max: progress.max,
    };
  });

  const reputation = reputationTierProgress(state);
  const reputationBar = {
    id: 'reputation',
    label: `Réputation · palier ${reputation.tier} · ${reputation.name} · ${
      reputation.isMax ? 'max' : `${formatCount(state.reputationEarned)} gagnés`
    }`,
    value: reputation.value,
    max: reputation.max,
  };

  return {
    stats: [...skillBars, reputationBar],
    reputation: formatDecimal(state.reputation),
  };
};
