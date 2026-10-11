import { useGameContext } from '@context/GameContext';
import { formatDate, formatMoney } from '@game/format';
import { dateOf } from '@game/time';

// Argent, date et jauge de temps de l'en-tête fixe.
export const useGameHeader = () => {
  const { state } = useGameContext();
  return {
    money: formatMoney(state.money),
    date: formatDate(dateOf(state)),
    gauge: { value: state.gauge, max: state.gaugeCapacity },
  };
};
