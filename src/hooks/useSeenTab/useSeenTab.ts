import { useEffect } from 'react';
import { useGameContext } from '@context/GameContext';
import { newItems } from '@game/novelty';
import type { NoveltyTab } from '@game/novelty';

// Ouvrir l'onglet en voit les nouveautés, y compris celles qui se débloquent
// pendant qu'il est ouvert.
export const useSeenTab = (tab: NoveltyTab) => {
  const { state, dispatch } = useGameContext();
  const hasNew = newItems(state, tab).length > 0;

  useEffect(() => {
    if (hasNew) {
      dispatch({ type: 'markSeen', tab });
    }
  }, [hasNew, tab, dispatch]);
};
