import { childPlaces, findById } from '@game/data';
import type { ChildPlace } from '@game/data';
import type { ChildPlaceId, GameState } from '@game/state';
import { advance } from './advance';
import { giveObject } from './childState';
import { nextRandom } from './random';
import { canAct } from './status';

// Les objets d'un lieu que l'enfant n'a pas encore.
export const remainingFinds = (state: GameState, place: ChildPlace) =>
  place.finds.filter((id) => !state.child.objects.includes(id));

export const isPlaceOpen = (state: GameState, place: ChildPlace) =>
  state.child.quarter >= place.minQuarter;

// Fouille un lieu : chaque geste avance la jauge de fouille, et la jauge pleine
// rend un objet tiré (graine de l'état) parmi ceux qu'on n'a pas encore.
export const explore = (state: GameState, placeId: ChildPlaceId): GameState => {
  const place = findById(childPlaces, placeId);
  if (
    place === undefined ||
    !canAct(state) ||
    !isPlaceOpen(state, place) ||
    remainingFinds(state, place).length === 0
  ) {
    return state;
  }
  const searched = state.child.search[placeId] + 1;
  const isFound = searched >= place.steps;
  let next: GameState = {
    ...state,
    child: {
      ...state.child,
      search: { ...state.child.search, [placeId]: isFound ? 0 : searched },
    },
  };
  if (isFound) {
    const finds = remainingFinds(next, place);
    const [roll, seed] = nextRandom(next.child.seed);
    const found = finds[Math.floor(roll * finds.length)];
    next = { ...next, child: { ...next.child, seed } };
    if (found !== undefined) {
      next = giveObject(next, found);
    }
  }
  return advance(next);
};
