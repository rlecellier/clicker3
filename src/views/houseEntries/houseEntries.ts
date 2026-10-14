import {
  childAxes,
  childObjects,
  childPlaces,
  childRules,
  childWishes,
  findById,
} from '@game/data';
import {
  activityPole,
  availableActivities,
  canAct,
  isChildhoodOver,
  isPlaceOpen,
  isWishOpen,
  remainingFinds,
  wishAnswer,
} from '@game/earlyChildhood';
import type { GameAction } from '@game/reducer';
import type { GameState } from '@game/state';

// Une ligne de la Maison : tout ce que l'enfant peut faire ici. L'écran Vie
// reprend celles qu'on a mises en favori.
export type HouseEntry = {
  id: string;
  // Rubrique : un objet, « Savoir-faire », « Sortir » ou « Demander ».
  group: string;
  title: string;
  detail: string;
  actionLabel: string;
  isDisabled: boolean;
  reason?: string;
  // Message de retour après le geste (la réponse des parents, une trouvaille).
  feedback?: string;
  action: GameAction;
};

const KNOW_HOW = 'Savoir-faire';
const GO_OUT = 'Sortir';
const ASK = 'Demander';

const activityEntries = (state: GameState): HouseEntry[] =>
  availableActivities(state).map((activity) => {
    const axis = findById(childAxes, activity.axis);
    const group =
      activity.source.type === 'object'
        ? (findById(childObjects, activity.source.id)?.name ?? KNOW_HOW)
        : KNOW_HOW;
    return {
      id: activity.id,
      group,
      title: activity.name,
      detail:
        axis === undefined
          ? ''
          : `${axis.name} → ${activityPole(activity, axis)}`,
      actionLabel: 'Jouer',
      isDisabled: !canAct(state),
      action: { type: 'doActivity', id: activity.id },
    };
  });

const placeEntries = (state: GameState): HouseEntry[] =>
  childPlaces
    .filter((place) => isPlaceOpen(state, place))
    .map((place) => {
      const isExhausted = remainingFinds(state, place).length === 0;
      return {
        id: `explore:${place.id}`,
        group: GO_OUT,
        title: place.name,
        detail: isExhausted
          ? 'Plus rien à trouver ici.'
          : `Fouille : ${state.child.search[place.id]} sur ${place.steps}`,
        actionLabel: 'Explorer',
        isDisabled: !canAct(state) || isExhausted,
        reason: isExhausted ? 'Tout a été trouvé.' : undefined,
        action: { type: 'explore', place: place.id },
      };
    });

const wishEntries = (state: GameState): HouseEntry[] =>
  childWishes
    .filter((wish) => isWishOpen(state, wish))
    .map((wish) => {
      const isTired = state.child.attention < childRules.askCost;
      const answer = wishAnswer(state, wish);
      const feedback = {
        yes: `« Oui. » Vous recevez ${wish.name.toLowerCase()}.`,
        later: '« On verra. » Ce sera pour dans quelques mois.',
        no: '« Non. » Les parents ont d’autres priorités.',
      }[answer];
      return {
        id: `ask:${wish.id}`,
        group: ASK,
        title: `Réclamer ${wish.name.toLowerCase()}`,
        detail: `Coûte ${childRules.askCost} d’Attention.`,
        actionLabel: 'Demander',
        isDisabled: !canAct(state) || isTired,
        reason: isTired ? 'Les parents n’ont plus d’Attention.' : undefined,
        feedback,
        action: { type: 'askFor', wishId: wish.id },
      };
    });

// Toutes les lignes de la Maison, dans l'ordre : activités, sorties, demandes.
export const houseEntries = (state: GameState): HouseEntry[] =>
  isChildhoodOver(state)
    ? []
    : [
        ...activityEntries(state),
        ...placeEntries(state),
        ...wishEntries(state),
      ];
