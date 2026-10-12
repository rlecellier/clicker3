import { districts, findById } from '@game/data';
import { isRequirementMet } from '@game/requirements';
import { canSpendReputation, spendReputation } from '@game/reputation';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

export const districtById = (id: string) => findById(districts, id);

export const canUnlockDistrict = (state: GameState, id: string) => {
  const district = districtById(id);
  return (
    isPlaying(state) &&
    district !== undefined &&
    !state.districts.includes(id) &&
    canSpendReputation(state, district.cost) &&
    isRequirementMet(state, district.requirement)
  );
};

// Si le quartier ne peut pas être débloqué, l'état est rendu inchangé.
export const unlockDistrict = (state: GameState, id: string): GameState => {
  const district = districtById(id);
  if (district === undefined || !canUnlockDistrict(state, id)) {
    return state;
  }
  const paid = spendReputation(state, district.cost);
  return { ...paid, districts: [...paid.districts, id] };
};
