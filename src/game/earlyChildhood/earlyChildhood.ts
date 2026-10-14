import { childActivities, childRules, findById } from '@game/data';
import type { ChildActivity, ChildAxis } from '@game/data';
import type { GameState } from '@game/state';
import { advance } from './advance';
import { pushAxis } from './childState';
import { canAct } from './status';

// Âge de l'enfant : un trimestre dure trois mois.
export const childAge = ({ child }: GameState) => ({
  years: Math.floor(child.quarter / 4),
  months: (child.quarter % 4) * 3,
});

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
  return activity === undefined ||
    !canAct(state) ||
    !isActivityAvailable(state, activity)
    ? state
    : advance(
        pushAxis(state, activity.axis, activity.direction * activity.amount),
      );
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
