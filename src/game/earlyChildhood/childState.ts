import {
  childObjects,
  childRules,
  childTraits,
  childWishes,
  findById,
} from '@game/data';
import type { ChildAxisId, GameState } from '@game/state';

const clampAxis = (value: number) =>
  Math.max(-childRules.axisLimit, Math.min(childRules.axisLimit, value));

// Déplace un axe (signé), sans jamais sortir de −100 / +100.
export const pushAxis = (
  state: GameState,
  axis: ChildAxisId,
  amount: number,
): GameState => ({
  ...state,
  child: {
    ...state.child,
    axes: {
      ...state.child.axes,
      [axis]: clampAxis(state.child.axes[axis] + amount),
    },
  },
});

// Un objet arrive : sans effet s'il est déjà possédé ou inconnu.
export const giveObject = (state: GameState, id: string): GameState =>
  findById(childObjects, id) === undefined || state.child.objects.includes(id)
    ? state
    : {
        ...state,
        child: { ...state.child, objects: [...state.child.objects, id] },
      };

// Un objet part (cassé, prêté, déménagement) : ses activités avec lui.
export const removeObject = (state: GameState, id: string): GameState =>
  state.child.objects.includes(id)
    ? {
        ...state,
        child: {
          ...state.child,
          objects: state.child.objects.filter((owned) => owned !== id),
        },
      }
    : state;

// Un trait s'ajoute si on en a moins de trois et qu'on ne l'a pas déjà : au-delà,
// il faut renoncer.
export const addTrait = (state: GameState, id: string): GameState =>
  findById(childTraits, id) === undefined ||
  state.child.traits.includes(id) ||
  state.child.traits.length >= childRules.traitLimit
    ? state
    : {
        ...state,
        child: { ...state.child, traits: [...state.child.traits, id] },
      };

// Les souhaits « plus tard » dont l'heure est venue arrivent.
export const deliverWishes = (state: GameState): GameState => {
  const due = state.child.later.filter(({ at }) => at <= state.child.quarter);
  if (due.length === 0) {
    return state;
  }
  let next: GameState = {
    ...state,
    child: {
      ...state.child,
      later: state.child.later.filter(({ at }) => at > state.child.quarter),
    },
  };
  for (const { id } of due) {
    const wish = findById(childWishes, id);
    if (wish !== undefined) {
      next = giveObject(next, wish.object);
    }
  }
  return next;
};
