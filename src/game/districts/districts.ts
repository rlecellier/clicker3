import { districts } from '@game/data';
import { isUnlocked } from '@game/requirements';
import { canSpendReputation, spendReputation } from '@game/reputation';
import type { GameState } from '@game/state';

export const canUnlockDistrict = (state: GameState, id: string) => {
  const district = districts.find((candidate) => candidate.id === id);
  return (
    state.status === 'playing' &&
    district !== undefined &&
    !state.districts.includes(id) &&
    canSpendReputation(state, district.cost) &&
    (district.requirement === undefined ||
      isUnlocked(state, district.requirement))
  );
};

// Si le quartier ne peut pas être débloqué, l'état est rendu inchangé.
export const unlockDistrict = (state: GameState, id: string): GameState => {
  const district = districts.find((candidate) => candidate.id === id);
  if (district === undefined || !canUnlockDistrict(state, id)) {
    return state;
  }
  const paid = spendReputation(state, district.cost);
  return { ...paid, districts: [...paid.districts, id] };
};
