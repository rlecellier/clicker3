import { findById, lifeSlices } from '@game/data';
import type { LifeSlice } from '@game/data';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

export const currentSlice = (state: GameState): LifeSlice | undefined =>
  findById(lifeSlices, state.lifeSlice);

// La tranche est un des mini-jeux d'avant 18 ans (son bouton « grandir »).
export const hasGrowth = (state: GameState) =>
  currentSlice(state)?.growth != null;

// Onglets de l'écran de jeu ouverts dans la tranche courante.
export const sliceTabs = (state: GameState): readonly string[] =>
  currentSlice(state)?.tabs ?? [];

// Le bouton d'une tranche avant 18 ans : le compteur monte d'un cran.
export const grow = (state: GameState): GameState =>
  isPlaying(state) && hasGrowth(state)
    ? { ...state, growth: state.growth + 1 }
    : state;
