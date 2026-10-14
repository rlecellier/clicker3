import { useGameContext } from '@context/GameContext';
import { childAxes, childRules, childTraits, findById } from '@game/data';
import { axisReading, childAge, isChildhoodOver } from '@game/earlyChildhood';
import { formatCount } from '@game/format';
import { useFavorites } from '@hook/useFavorites';
import { useFeedback } from '@hook/useFeedback';
import { useGameActions } from '@hook/useGameActions';
import { useHoldRepeat } from '@hook/useHoldRepeat';
import { useLifeSlice } from '@hook/useLifeSlice';
import { houseEntries } from '@view/houseEntries';

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
// et les lignes de la Maison mises en favori.
export const useEarlyChildhoodScreen = () => {
  const { state, dispatch } = useGameContext();
  const { slice } = useLifeSlice();
  const actions = useGameActions();
  const { favorites } = useFavorites();
  const { feedback, say } = useFeedback();
  const isOver = isChildhoodOver(state);
  const babblePress = useHoldRepeat({
    onClick: actions.grow,
    isDisabled: isOver,
  });
  const { years, months } = childAge(state);
  const entries = houseEntries(state);

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
    attention: {
      value: Math.round(state.child.attention),
      max: childRules.attentionMax,
      // Elle ne sert qu'à réclamer, donc à partir de 4 ans.
      isVisible: entries.some(({ id }) => id.startsWith('ask:')),
    },
    traits: state.child.traits
      .map((id) => findById(childTraits, id)?.name)
      .filter((name) => name !== undefined),
    babble: { run: babblePress.onClick, press: babblePress.press },
    favorites: favorites
      .map((id) => entries.find((entry) => entry.id === id))
      .filter((entry) => entry !== undefined)
      .map((entry) => {
        const run = () => {
          dispatch(entry.action);
        };
        return {
          id: entry.id,
          label: entry.title,
          detail: entry.detail,
          reason: entry.reason,
          isDisabled: entry.isDisabled,
          run: entry.feedback === undefined ? run : say(entry.feedback, run),
        };
      }),
    feedback,
    hasHouse: state.child.objects.length > 0,
  };
};
