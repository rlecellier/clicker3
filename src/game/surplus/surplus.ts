import { economyRules } from '@game/data';
import { addGauge } from '@game/period';
import type { GameState } from '@game/state';

export const canSellSurplus = (state: GameState) =>
  state.status === 'playing' && state.stock > 0;

// Vend tout le stock à bas prix : évite le blocage en début de phase
// Entrepreneur, quand on produit sans encore pouvoir vendre.
export const sellSurplus = (state: GameState): GameState => {
  if (!canSellSurplus(state)) {
    return state;
  }
  const sold = {
    ...state,
    stock: 0,
    money: state.money + Math.round(state.stock * economyRules.surplusPrice),
  };
  return addGauge(sold, economyRules.surplusGauge);
};
