import { useGameContext } from '@context/GameContext';
import { childRules } from '@game/data';
import type { InfoListItem } from '@component/ItemList';
import { childAge, isChildhoodOver } from '@game/earlyChildhood';
import { formatCount } from '@game/format';
import { useFavorites } from '@hook/useFavorites';
import { useFeedback } from '@hook/useFeedback';
import { useGameActions } from '@hook/useGameActions';
import { useHoldRepeat } from '@hook/useHoldRepeat';
import { useLifeSlice } from '@hook/useLifeSlice';
import { axisFigures, traitItems } from '@view/childCharacter';
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

// Onglet « Vie » de la petite enfance : l'éveil, « Gazouiller »
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
    attention: {
      value: Math.round(state.child.attention),
      max: childRules.attentionMax,
      // Elle ne sert qu'à réclamer, donc à partir de 4 ans.
      isVisible: entries.some(({ id }) => id.startsWith('ask:')),
    },
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
    report: isOver
      ? {
          title: 'Carnet de santé',
          intro:
            'L’enfant a cinq ans révolus. Le service remercie les parents de leur coopération et prend acte de ce qui suit.',
          figures: [
            ...axisFigures(state.child.axes),
            {
              label: 'Événements vécus',
              value: formatCount(state.child.firedEvents.length),
            },
            { label: 'Objets', value: formatCount(state.child.objects.length) },
          ],
          traits: traitItems(state.child.traits),
          people: state.relations.map((relation): InfoListItem => ({
            id: relation.id,
            title: `${relation.name} (${relation.role})`,
            detail: `Lien : ${relation.bond} sur 100.`,
          })),
          enterLabel: 'Entrer en Enfance',
          enter: () => {
            dispatch({ type: 'enterChildhood' });
          },
        }
      : null,
    hasHouse: state.child.objects.length > 0,
  };
};
