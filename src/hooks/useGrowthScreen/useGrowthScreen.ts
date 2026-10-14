import { useGameContext } from '@context/GameContext';
import { formatCount } from '@game/format';
import { useGameActions } from '@hook/useGameActions';
import { useHoldRepeat } from '@hook/useHoldRepeat';
import { useLifeSlice } from '@hook/useLifeSlice';
import { axisFigures, traitItems } from '@view/childCharacter';

// Onglet « Vie » d'une tranche avant 18 ans : un bouton et son compteur.
export const useGrowthScreen = () => {
  const { state } = useGameContext();
  const { slice } = useLifeSlice();
  const actions = useGameActions();
  const growthPress = useHoldRepeat({ onClick: actions.grow });
  return {
    title: slice?.name ?? '',
    ages: slice?.ages ?? '',
    actionLabel: slice?.growth?.actionLabel ?? '',
    counterLabel: slice?.growth?.counterLabel ?? '',
    count: formatCount(state.growth),
    // Ce que la petite enfance a laissé, quand on en vient.
    inherited:
      state.carry === null
        ? null
        : {
            figures: axisFigures(state.carry.axes),
            traits: traitItems(state.carry.traits),
          },
    run: growthPress.onClick,
    press: growthPress.press,
  };
};
