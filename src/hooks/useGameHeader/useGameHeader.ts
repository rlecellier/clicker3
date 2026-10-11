import { useGameContext } from '@context/GameContext';
import { formatMoney } from '@game/format';

// Argent et jauge de temps de l'en-tête fixe.
export const useGameHeader = () => {
  const { state } = useGameContext();
  return {
    money: formatMoney(state.money),
    gauge: { value: state.gauge, max: state.gaugeCapacity },
  };
};
