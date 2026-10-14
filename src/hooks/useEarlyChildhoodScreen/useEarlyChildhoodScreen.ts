import { useGameContext } from '@context/GameContext';
import { childAxes, childRules, findById } from '@game/data';
import {
  activityPole,
  availableActivities,
  axisReading,
  childAge,
  isChildhoodOver,
} from '@game/earlyChildhood';
import { formatCount } from '@game/format';
import { useFavorites } from '@hook/useFavorites';
import { useGameActions } from '@hook/useGameActions';
import { useHoldRepeat } from '@hook/useHoldRepeat';
import { useLifeSlice } from '@hook/useLifeSlice';

const agePart = (count: number, unit: string) =>
  `${count} ${unit}${unit !== 'mois' && count > 1 ? 's' : ''}`;

// « 1 an et 3 mois », « 2 ans », « 3 mois ».
const formatChildAge = (years: number, months: number) => {
  const parts = [
    years > 0 ? agePart(years, 'an') : '',
    months > 0 ? agePart(months, 'mois') : '',
  ].filter((part) => part !== '');
  return parts.length === 0 ? 'Nouveau-né' : parts.join(' et ');
};

// Onglet « Vie » de la petite enfance : l'éveil, les quatre axes, « Gazouiller »
// et les activités mises en favori dans la Maison.
export const useEarlyChildhoodScreen = () => {
  const { state } = useGameContext();
  const { slice } = useLifeSlice();
  const actions = useGameActions();
  const { favorites } = useFavorites();
  const babblePress = useHoldRepeat({
    onClick: actions.grow,
    isDisabled: isChildhoodOver(state),
  });
  const isOver = isChildhoodOver(state);
  const { years, months } = childAge(state);
  const available = availableActivities(state);

  return {
    title: slice?.name ?? '',
    ages: slice?.ages ?? '',
    age: formatChildAge(years, months),
    awakening: formatCount(state.growth),
    isOver,
    overText: isOver ? 'Cinq ans révolus : la petite enfance est finie.' : '',
    axes: childAxes.map((axis) => {
      const { pole, amount } = axisReading(axis, state.child.axes[axis.id]);
      return {
        id: axis.id,
        label: `${axis.name} : ${pole}`,
        value: amount,
        max: childRules.axisLimit,
      };
    }),
    babble: { run: babblePress.onClick, press: babblePress.press },
    favorites: favorites
      .map((id) => available.find((candidate) => candidate.id === id))
      .filter((activity) => activity !== undefined)
      .map((activity) => {
        const axis = findById(childAxes, activity.axis);
        return {
          id: activity.id,
          label: activity.name,
          detail:
            axis === undefined
              ? ''
              : `${axis.name} → ${activityPole(activity, axis)}`,
          isDisabled: isOver,
          run: () => {
            actions.doActivity(activity.id);
          },
        };
      }),
    hasHouse: state.child.objects.length > 0,
  };
};
