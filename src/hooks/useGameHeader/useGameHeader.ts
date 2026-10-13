import { useGameContext } from '@context/GameContext';
import { currentActivity } from '@game/activity';
import {
  activityLabels,
  formatCompact,
  formatCompactMoney,
  formatCount,
  formatPeriodDate,
  formatMoney,
} from '@game/format';

// Ressources (argent, stock), date, activité en cours et jauge de temps de
// l'en-tête fixe.
export const useGameHeader = () => {
  const { state } = useGameContext();
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
    date: formatPeriodDate(state),
    activity: activityLabels[currentActivity(state)],
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
