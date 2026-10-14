import {
  childActivities,
  childObjects,
  childRules,
  findById,
} from '@game/data';
import type { ChildActivity, ChildAxis } from '@game/data';
import { isPlaying } from '@game/state';
import type { ChildAxisId, ChildState, GameState } from '@game/state';

// La petite enfance est la tranche de départ de la partie.
export const isEarlyChildhood = (state: GameState) =>
  state.lifeSlice === 'earlyChildhood';

// Les 6 ans sont passés : la tranche est finie, plus aucune action ne joue.
export const isChildhoodOver = (state: GameState) =>
  state.child.quarter >= childRules.quarters;

const canAct = (state: GameState) =>
  isEarlyChildhood(state) && isPlaying(state) && !isChildhoodOver(state);

// Âge de l'enfant : un trimestre dure trois mois.
export const childAge = ({ child }: GameState) => ({
  years: Math.floor(child.quarter / 4),
  months: (child.quarter % 4) * 3,
});

const clampAxis = (value: number) =>
  Math.max(-childRules.axisLimit, Math.min(childRules.axisLimit, value));

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

// Chaque geste remplit la jauge du trimestre ; l'entourage offre un objet à
// mesure que l'éveil monte.
const advance = (state: GameState): GameState => {
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
  return next;
};

// « Gazouiller » : le bouton de départ, sans pôle. Il fait monter l'éveil.
export const babble = (state: GameState): GameState =>
  canAct(state) ? advance(state) : state;

// Position d'un axe : le pôle vers lequel il penche, à partir de zéro.
export const axisSide = (value: number): 1 | -1 | 0 =>
  Math.sign(value) as 1 | -1 | 0;

// Une activité est possible quand son objet est possédé ou que son axe est
// assez marqué du bon côté.
export const isActivityAvailable = (
  state: GameState,
  activity: ChildActivity,
): boolean => {
  const { source } = activity;
  return source.type === 'object'
    ? state.child.objects.includes(source.id)
    : state.child.axes[source.axis] * source.direction >=
        childRules.axisThreshold;
};

export const availableActivities = (state: GameState): ChildActivity[] =>
  childActivities.filter((activity) => isActivityAvailable(state, activity));

// Joue une activité : l'axe se déplace de sa part vers son pôle, sans hasard.
export const doActivity = (state: GameState, id: string): GameState => {
  const activity = findById(childActivities, id);
  if (
    activity === undefined ||
    !canAct(state) ||
    !isActivityAvailable(state, activity)
  ) {
    return state;
  }
  const axes: Record<ChildAxisId, number> = {
    ...state.child.axes,
    [activity.axis]: clampAxis(
      state.child.axes[activity.axis] + activity.direction * activity.amount,
    ),
  };
  return advance({ ...state, child: { ...state.child, axes } });
};

// Ce que dit un axe : le pôle vers lequel il penche (« Neutre » à zéro) et de
// combien, de 0 à la limite.
export const axisReading = (axis: ChildAxis, value: number) => {
  const side = axisSide(value);
  const pole = side === 1 ? axis.positive : axis.negative;
  return { pole: side === 0 ? 'Neutre' : pole, amount: Math.abs(value) };
};

// Le pôle qu'une activité fait grandir, pour l'afficher à côté de son nom.
export const activityPole = (activity: ChildActivity, axis: ChildAxis) =>
  activity.direction === 1 ? axis.positive : axis.negative;
