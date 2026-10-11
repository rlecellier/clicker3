import type { GameState } from '@game/state';

export type Rolled<T> = [value: T, state: GameState];

// mulberry32 : la graine est l’état du générateur (entier 32 bits).
// 1_831_565_813 = 0x6D2B79F5.
export const next = (state: GameState): Rolled<number> => {
  const seed = (state.seed + 1_831_565_813) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  return [value, { ...state, seed }];
};

/**
 * Hasard lissé : deux tirages sommés donnent une loi triangulaire, centrée sur
 * `expected`, qui s'écarte d'au plus `expected × variance` (variance entre 0 et 1).
 */
export const smoothedRoll = (
  state: GameState,
  expected: number,
  variance: number,
): Rolled<number> => {
  const [first, afterFirst] = next(state);
  const [second, afterSecond] = next(afterFirst);
  const spread = first + second - 1;
  return [expected * (1 + variance * spread), afterSecond];
};
