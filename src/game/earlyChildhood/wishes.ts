import { childRules, childWishes, findById } from '@game/data';
import type { ChildWish } from '@game/data';
import type { GameState } from '@game/state';
import { advance } from './advance';
import { giveObject } from './childState';
import { familyQualities } from './family';
import { canAct } from './status';

export type WishAnswer = 'yes' | 'later' | 'no';

// La réponse des parents ne dépend pas du hasard : les moyens de la famille
// contre le prix de l'objet.
export const wishAnswer = (state: GameState, wish: ChildWish): WishAnswer => {
  const { means } = familyQualities(state);
  if (means >= wish.cost) {
    return 'yes';
  }
  return means >= wish.cost - childRules.laterMargin ? 'later' : 'no';
};

// On peut réclamer un objet qu'on n'a pas, qu'on n'attend pas déjà, quand
// l'âge est venu et que l'Attention suffit.
export const isWishOpen = (state: GameState, wish: ChildWish) =>
  state.child.quarter >= wish.minQuarter &&
  !state.child.objects.includes(wish.object) &&
  state.child.later.every(({ id }) => id !== wish.id);

export const canAsk = (state: GameState, wish: ChildWish) =>
  canAct(state) &&
  isWishOpen(state, wish) &&
  state.child.attention >= childRules.askCost;

// Réclame un objet : l'Attention est dépensée, et l'objet arrive tout de suite
// (oui), dans `laterDelay` trimestres (plus tard) ou jamais (non).
export const askFor = (state: GameState, wishId: string): GameState => {
  const wish = findById(childWishes, wishId);
  if (wish === undefined || !canAsk(state, wish)) {
    return state;
  }
  const answer = wishAnswer(state, wish);
  let next: GameState = {
    ...state,
    child: {
      ...state.child,
      attention: state.child.attention - childRules.askCost,
    },
  };
  if (answer === 'yes') {
    next = giveObject(next, wish.object);
  } else if (answer === 'later') {
    next = {
      ...next,
      child: {
        ...next.child,
        later: [
          ...next.child.later,
          { id: wish.id, at: next.child.quarter + childRules.laterDelay },
        ],
      },
    };
  }
  return advance(next);
};
