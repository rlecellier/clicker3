import type { ActiveEffect, GameState } from '@game/state';

// Somme des effets temporaires d'un genre encore actifs.
export const activeBonus = (state: GameState, kind: ActiveEffect['kind']) =>
  state.activeEffects
    .filter((effect) => effect.kind === kind && effect.until > state.period)
    .reduce((total, effect) => total + effect.value, 0);

// Retire les effets arrivés à échéance.
export const expireEffects = (state: GameState): GameState => {
  const remaining = state.activeEffects.filter(
    (effect) => effect.until > state.period,
  );
  return remaining.length === state.activeEffects.length
    ? state
    : { ...state, activeEffects: remaining };
};
