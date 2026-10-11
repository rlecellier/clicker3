import { useMemo } from 'react';
import { useGameContext } from '@context/GameContext';

// Les gestes du joueur : chacun envoie une action au reducer des règles.
export const useGameActions = () => {
  const { dispatch } = useGameContext();
  return useMemo(
    () => ({
      work: (target: string) => {
        dispatch({ type: 'work', target });
      },
      study: (courseId: string) => {
        dispatch({ type: 'study', courseId });
      },
      changeJob: (id: string) => {
        dispatch({ type: 'changeJob', id });
      },
      buyCompany: (id: string) => {
        dispatch({ type: 'buyCompany', id });
      },
      sellSurplus: () => {
        dispatch({ type: 'sellSurplus' });
      },
      buyUpgrade: (id: string) => {
        dispatch({ type: 'buyUpgrade', id });
      },
      cancelUpgrade: (id: string) => {
        dispatch({ type: 'cancelUpgrade', id });
      },
      unlockDistrict: (id: string) => {
        dispatch({ type: 'unlockDistrict', id });
      },
      setAuto: (action: 'work', isEnabled: boolean) => {
        dispatch({ type: 'setAuto', action, isEnabled });
      },
      restart: () => {
        dispatch({ type: 'restart' });
      },
    }),
    [dispatch],
  );
};
