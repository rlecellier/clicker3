import { childObjects, childRules } from '@game/data';
import type { ChildState, GameState } from '@game/state';
import { deliverWishes, giveObject } from './childState';
import { scheduleEvent } from './events';
import { familyQualities } from './family';
import { applyBondBonuses } from '@game/relations';

// Chaque geste remplit la jauge du trimestre et fait monter l'éveil ; l'entourage
// offre un objet à mesure que l'éveil monte. Un trimestre qui passe rend de
// l'Attention, livre les souhaits promis et peut ouvrir un événement.
export const advance = (state: GameState): GameState => {
  const growth = state.growth + 1;
  const filled = state.child.fill + 1;
  const isQuarterDone = filled >= childRules.quarterCapacity;
  const child: ChildState = {
    ...state.child,
    quarter: state.child.quarter + (isQuarterDone ? 1 : 0),
    fill: isQuarterDone ? 0 : filled,
  };
  let next: GameState = { ...state, growth, child };
  for (const object of childObjects) {
    if (object.giftAt === growth) {
      next = giveObject(next, object.id);
    }
  }
  if (!isQuarterDone) {
    return next;
  }
  const regen = Math.round(
    familyQualities(next).availability / childRules.attentionRegenDivisor,
  );
  next = {
    ...next,
    child: {
      ...next.child,
      attention: Math.min(
        childRules.attentionMax,
        next.child.attention + regen,
      ),
    },
  };
  return scheduleEvent(applyBondBonuses(deliverWishes(next)));
};
