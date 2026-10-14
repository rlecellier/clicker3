import { findById, lifeSlices } from '@game/data';
import type { LifeSlice } from '@game/data';
import { babble, isEarlyChildhood } from '@game/earlyChildhood';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

export const currentSlice = (state: GameState): LifeSlice | undefined =>
  findById(lifeSlices, state.lifeSlice);

// La tranche est un des mini-jeux d'avant 18 ans (son bouton « grandir »).
export const hasGrowth = (state: GameState) =>
  currentSlice(state)?.growth != null;

// Onglets de l'écran de jeu ouverts dans la tranche courante.
// La Maison s'ouvre avec le premier objet : avant, il n'y a rien à y faire.
export const sliceTabs = (state: GameState): readonly string[] =>
  (currentSlice(state)?.tabs ?? []).filter(
    (tab) => tab !== 'house' || state.child.objects.length > 0,
  );

// Le bouton d'une tranche avant 18 ans : le compteur monte d'un cran.
// En petite enfance, c'est « Gazouiller » : l'éveil monte et le temps avance.
export const grow = (state: GameState): GameState => {
  if (isEarlyChildhood(state)) {
    return babble(state);
  }
  return isPlaying(state) && hasGrowth(state)
    ? { ...state, growth: state.growth + 1 }
    : state;
};
