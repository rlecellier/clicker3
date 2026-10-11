import { useGameContext } from '@context/GameContext';

export const useAbsenceSummary = () => {
  const { absence, dismissAbsence } = useGameContext();
  return { absence, dismissAbsence };
};
