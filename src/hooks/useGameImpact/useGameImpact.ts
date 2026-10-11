import { useMemo } from 'react';
import { useGameContext } from '@context/GameContext';
import { impactOf } from '@game/impact';
import { lifeSummary } from '@game/summary';

export const useGameImpact = () => {
  const { state } = useGameContext();
  return useMemo(() => impactOf(state), [state]);
};

// Bilan de fin de partie.
export const useLifeSummary = () => {
  const { state } = useGameContext();
  return useMemo(() => lifeSummary(state), [state]);
};
