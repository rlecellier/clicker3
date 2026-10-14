import { useGameContext } from '@context/GameContext';
import { currentSlice, hasGrowth, sliceTabs } from '@game/lifeSlices';

// La tranche de vie de la partie : son nom, ses onglets, et si c'est un
// mini-jeu d'avant 18 ans (un bouton, un compteur).
export const useLifeSlice = () => {
  const { state } = useGameContext();
  return {
    slice: currentSlice(state),
    tabs: sliceTabs(state),
    hasGrowth: hasGrowth(state),
  };
};
