import { useGameContext } from '@context/GameContext';
import { formatCount, formatDecimal, statLabels } from '@game/format';
import { jobById } from '@game/jobs';
import { reputationTierProgress } from '@game/reputation';
import { statIds } from '@game/state';
import { statProgress } from '@game/stats';
import { availableUpgrades } from '@game/upgrades';
import { useGameActions } from '@hook/useGameActions';
import { characterHeader } from '@view/characterHeader';
import { upgradeItem } from '@view/upgradeItems';

// Onglet Profil : la fiche du personnage, puis une barre par stat et la
// réputation au même format (son palier se calcule sur le cumul gagné).
export const useProfileScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();

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
    header: characterHeader(state),
    job:
      state.jobId === null
        ? 'Sans emploi'
        : (jobById(state.jobId)?.name ?? '—'),
    stats: [...skillBars, reputationBar],
    // Les améliorations qui touchent la personne, achetables d'ici.
    upgrades: availableUpgrades(state, 'person').map((upgrade) =>
      upgradeItem(state, upgrade, actions.buyUpgrade),
    ),
    reputation: formatDecimal(state.reputation),
  };
};
