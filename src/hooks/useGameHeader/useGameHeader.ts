import { useGameContext } from '@context/GameContext';
import {
  formatBalance,
  formatCompactMoney,
  formatDate,
  formatMoney,
} from '@game/format';
import { periodReports } from '@game/ledger';
import { dateOf } from '@game/time';

// Argent (abrégé) et sa balance de la période en cours, date et jauge de
// temps de l'en-tête fixe.
export const useGameHeader = () => {
  const { state } = useGameContext();
  const net = periodReports(state)[0]?.net ?? 0;
  return {
    money: formatCompactMoney(state.money),
    exactMoney: formatMoney(state.money),
    balance: formatBalance(net, ' €'),
    date: formatDate(dateOf(state)),
    gauge: { value: state.gauge, max: state.gaugeCapacity },
  };
};
