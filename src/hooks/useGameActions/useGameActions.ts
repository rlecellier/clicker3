import { useMemo } from 'react';
import { useGameContext } from '@context/GameContext';

// Les gestes du joueur : chacun envoie une action au reducer des règles.
export const useGameActions = () => {
  const { dispatch } = useGameContext();
  return useMemo(
    () => ({
      grow: () => {
        dispatch({ type: 'grow' });
      },
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
      buyWarehouse: () => {
        dispatch({ type: 'buyWarehouse' });
      },
      sellSurplus: () => {
        dispatch({ type: 'sellSurplus' });
      },
      buyUpgrade: (id: string) => {
        dispatch({ type: 'buyUpgrade', id });
      },
      buyBoost: (id: string) => {
        dispatch({ type: 'buyBoost', id });
      },
      cancelUpgrade: (id: string) => {
        dispatch({ type: 'cancelUpgrade', id });
      },
      unlockDistrict: (id: string) => {
        dispatch({ type: 'unlockDistrict', id });
      },
      setSleepHours: (hours: number) => {
        dispatch({ type: 'setSleepHours', hours });
      },
      setAuto: (action: 'work', isEnabled: boolean) => {
        dispatch({ type: 'setAuto', action, isEnabled });
      },
    }),
    [dispatch],
  );
};
