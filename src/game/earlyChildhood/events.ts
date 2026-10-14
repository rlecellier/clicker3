import {
  childAxes,
  childEvents,
  childObjects,
  childRules,
  childTraits,
  findById,
} from '@game/data';
import type { ChildCondition, ChildEffect, ChildEvent } from '@game/data';
import type { GameState } from '@game/state';
import { addTrait, giveObject, pushAxis, removeObject } from './childState';
import { nextRandom } from './random';
import { changeBond, meetFriend, relationById } from '@game/relations';

export const childEventById = (id: string | null) => findById(childEvents, id);

const isConditionMet = (
  state: GameState,
  condition: ChildCondition,
): boolean => {
  const { child } = state;
  switch (condition.type) {
    case 'age': {
      return (
        child.quarter >= (condition.min ?? 0) &&
        child.quarter <= (condition.max ?? Infinity)
      );
    }
    case 'axis': {
      return (
        child.axes[condition.axis] * condition.direction >= condition.atLeast
      );
    }
    case 'trait': {
      return child.traits.includes(condition.id);
    }
    case 'event': {
      return child.firedEvents.includes(condition.id);
    }
    case 'object': {
      return child.objects.includes(condition.id);
    }
    case 'bond': {
      return (
        (relationById(state, condition.person)?.bond ?? 0) >= condition.atLeast
      );
    }
    case 'context': {
      // Les contextes de départ viendront avec les situations (#259).
      return false;
    }
  }
};

// Les événements encore possibles : jamais vécus, toutes conditions remplies.
export const eligibleEvents = (state: GameState): ChildEvent[] =>
  childEvents.filter(
    (event) =>
      !state.child.firedEvents.includes(event.id) &&
      event.conditions.every((condition) => isConditionMet(state, condition)),
  );

const open = (state: GameState, event: ChildEvent): GameState => ({
  ...state,
  child: {
    ...state.child,
    pendingEvent: event.id,
    lastEventQuarter: state.child.quarter,
  },
});

// Tirage pondéré parmi les événements éligibles.
const pick = (events: readonly ChildEvent[], roll: number) => {
  const total = events.reduce((sum, { weight }) => sum + weight, 0);
  let remaining = roll * total;
  for (const event of events) {
    remaining -= event.weight;
    if (remaining < 0) {
      return event;
    }
  }
  return events.at(-1);
};

// À appeler quand un trimestre vient de passer : ouvre un événement ou non.
// Un événement obligatoire passe avant tout ; sinon la tranche en joue entre
// `min` et `max`, espacés, avec un tirage forcé quand le minimum risque
// d'être manqué.
export const scheduleEvent = (state: GameState): GameState => {
  const { child } = state;
  if (child.pendingEvent !== null) {
    return state;
  }
  const eligible = eligibleEvents(state);
  const mandatory = eligible.find((event) => event.isMandatory === true);
  if (mandatory !== undefined) {
    return open(state, mandatory);
  }
  const { min, max, spacing, chance } = childRules.events;
  const played = child.firedEvents.length;
  if (
    played >= max ||
    eligible.length === 0 ||
    child.quarter - child.lastEventQuarter < spacing
  ) {
    return state;
  }
  const missing = min - played;
  const isForced =
    missing > 0 && childRules.quarters - child.quarter <= missing * spacing;
  const [chanceRoll, afterChance] = nextRandom(child.seed);
  const rolled: GameState = {
    ...state,
    child: { ...child, seed: afterChance },
  };
  if (!isForced && chanceRoll >= chance) {
    return rolled;
  }
  const [pickRoll, afterPick] = nextRandom(afterChance);
  const chosen = pick(eligible, pickRoll);
  const next: GameState = {
    ...rolled,
    child: { ...rolled.child, seed: afterPick },
  };
  return chosen === undefined ? next : open(next, chosen);
};

const applyEffect = (state: GameState, effect: ChildEffect): GameState => {
  switch (effect.type) {
    case 'axis': {
      return pushAxis(state, effect.axis, effect.amount);
    }
    case 'trait': {
      return addTrait(state, effect.id);
    }
    case 'giveObject': {
      return giveObject(state, effect.id);
    }
    case 'removeObject': {
      return removeObject(state, effect.id);
    }
    case 'bond': {
      return changeBond(state, effect.person, effect.amount);
    }
    case 'meetFriend': {
      return meetFriend(state, effect.name, effect.bond);
    }
  }
};

// Le joueur répond à l'événement ouvert : les effets du choix s'appliquent,
// l'événement est vécu et le jeu reprend.
export const chooseEvent = (state: GameState, index: number): GameState => {
  const event = childEventById(state.child.pendingEvent);
  const choice = event?.choices[index];
  if (event === undefined || choice === undefined) {
    return state;
  }
  let next: GameState = {
    ...state,
    child: {
      ...state.child,
      pendingEvent: null,
      firedEvents: [...state.child.firedEvents, event.id],
    },
  };
  for (const effect of choice.effects) {
    next = applyEffect(next, effect);
  }
  return next;
};

const objectName = (id: string) => findById(childObjects, id)?.name ?? id;

// Ce que gagne ou perd un choix, en une ligne lisible (« Énergie → Vif »).
export const describeEffect = (
  state: GameState,
  effect: ChildEffect,
): string => {
  switch (effect.type) {
    case 'axis': {
      const axis = findById(childAxes, effect.axis);
      if (axis === undefined) {
        return '';
      }
      return `${axis.name} → ${effect.amount > 0 ? axis.positive : axis.negative}`;
    }
    case 'trait': {
      return `Trait : ${findById(childTraits, effect.id)?.name ?? effect.id}`;
    }
    case 'giveObject': {
      return `Reçoit : ${objectName(effect.id)}`;
    }
    case 'removeObject': {
      return `Perd : ${objectName(effect.id)}`;
    }
    case 'bond': {
      return `Lien avec ${relationById(state, effect.person)?.name ?? 'quelqu’un'} ${effect.amount > 0 ? '+' : '−'}`;
    }
    case 'meetFriend': {
      return `Rencontre : ${effect.name}`;
    }
  }
};
