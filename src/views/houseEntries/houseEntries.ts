import {
  childAxes,
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
import type { ChildAxisId, GameState } from '@game/state';

// Une ligne de la Maison : tout ce que l'enfant peut faire ici. L'écran Vie
// reprend celles qu'on a mises en favori.
export type HouseEntry = {
  id: string;
  // Rubrique d'une action qui ne pousse aucun axe : « Sortir » ou « Demander ».
  group: string;
  // L'axe qu'une activité pousse, et vers quel pôle (+1 ou −1).
  axis?: ChildAxisId;
  direction?: 1 | -1;
  title: string;
  detail: string;
  actionLabel: string;
  isDisabled: boolean;
  reason?: string;
  // Message de retour après le geste (la réponse des parents, une trouvaille).
  feedback?: string;
  action: GameAction;
};

const GO_OUT = 'Sortir';
const ASK = 'Demander';

const activityEntries = (state: GameState): HouseEntry[] =>
  availableActivities(state).map((activity) => {
    const axis = findById(childAxes, activity.axis);
    return {
      id: activity.id,
      group: axis?.name ?? '',
      axis: activity.axis,
      direction: activity.direction,
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

// Une section de la Maison par axe : à gauche les actions du pôle négatif, à
// droite celles du pôle positif.
export type AxisSection = {
  axisId: ChildAxisId;
  name: string;
  negativePole: string;
  positivePole: string;
  negative: HouseEntry[];
  positive: HouseEntry[];
};

// Les actions qui ne poussent aucun axe, par rubrique (« Sortir », « Demander »).
export type OtherSection = { caption: string; entries: HouseEntry[] };

export type HouseLayout = { axes: AxisSection[]; others: OtherSection[] };

// Range les lignes de la Maison par statistique (dans l'ordre des axes, sans
// les axes qui n'ont aucune action), puis par rubrique.
export const houseLayout = (entries: readonly HouseEntry[]): HouseLayout => {
  const axes = childAxes
    .map((axis): AxisSection => {
      const own = entries.filter(({ axis: id }) => id === axis.id);
      return {
        axisId: axis.id,
        name: axis.name,
        negativePole: axis.negative,
        positivePole: axis.positive,
        negative: own.filter(({ direction }) => direction === -1),
        positive: own.filter(({ direction }) => direction === 1),
      };
    })
    .filter(({ negative, positive }) => negative.length + positive.length > 0);
  const others = new Map<string, HouseEntry[]>();
  for (const entry of entries) {
    if (entry.axis === undefined) {
      others.set(entry.group, [...(others.get(entry.group) ?? []), entry]);
    }
  }
  return {
    axes,
    others: [...others].map(([caption, grouped]) => ({
      caption,
      entries: grouped,
    })),
  };
};
