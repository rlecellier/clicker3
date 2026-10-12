import { useGameContext } from '@context/GameContext';
import {
  formatCompact,
  formatCompactMoney,
  formatCount,
  formatPeriodDate,
  formatMoney,
} from '@game/format';
import { reputationTiers } from '@game/data';
import { reputationTierProgress } from '@game/reputation';

// Ressources (argent, stock), palier de réputation, date et jauge de temps de
// l'en-tête fixe.
export const useGameHeader = () => {
  const { state } = useGameContext();
  const { tier, name } = reputationTierProgress(state);
  return {
    resources: {
      money: {
        value: formatCompactMoney(state.money),
        exact: formatMoney(state.money),
      },
      stock: {
        value: `${formatCompact(state.stock)} / ${formatCompact(state.stockCapacity)}`,
        exact: `${formatCount(state.stock)} / ${formatCount(state.stockCapacity)}`,
      },
    },
    reputation: {
      tier,
      // « Inconnu » (palier 0) n'a pas d'étoile.
      max: reputationTiers.length - 1,
      label: `Réputation : palier ${tier} sur ${reputationTiers.length - 1} · ${name}`,
    },
    date: formatPeriodDate(state),
    gauge: {
      value: state.gauge,
      max: state.gaugeCapacity,
      segments: state.gaugeSegments.map(({ kind, amount }) => ({
        tone: kind,
        value: amount,
      })),
    },
  };
};
