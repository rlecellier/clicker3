import { useGameContext } from '@context/GameContext';
import {
  formatBalance,
  formatCompactMoney,
  formatDate,
  formatMoney,
} from '@game/format';
import { periodOutlook } from '@game/period';
import { dateOf } from '@game/time';

// Argent (abrégé) et sa balance de la période en cours, date et jauge de
// temps de l'en-tête fixe.
export const useGameHeader = () => {
  const { state } = useGameContext();
  const { money } = periodOutlook(state);
  return {
    money: formatCompactMoney(state.money),
    exactMoney: formatMoney(state.money),
    balance: formatBalance(money, ' €'),
    date: formatDate(dateOf(state)),
    gauge: { value: state.gauge, max: state.gaugeCapacity },
  };
};
