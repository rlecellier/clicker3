import { useGameContext } from '@context/GameContext';
import { formatCount } from '@game/format';
import { useGameActions } from '@hook/useGameActions';
import { useHoldRepeat } from '@hook/useHoldRepeat';
import { useLifeSlice } from '@hook/useLifeSlice';

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
    run: growthPress.onClick,
    press: growthPress.press,
  };
};
