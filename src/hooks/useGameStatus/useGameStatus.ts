import { useGameContext } from '@context/GameContext';
import { ageOf, dateOf } from '@game/time';

export const useGameStatus = () => {
  const { state } = useGameContext();
  return {
    characterName: state.characterName,
    status: state.status,
    phase: state.phase,
    age: ageOf(state),
    date: dateOf(state),
    gauge: state.gauge,
    gaugeCapacity: state.gaugeCapacity,
    money: state.money,
    stock: state.stock,
    stockCapacity: state.stockCapacity,
    reputation: state.reputation,
    stats: state.stats,
    markers: state.markers,
    maxMarkers: state.maxMarkers,
  };
};
