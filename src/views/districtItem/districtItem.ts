import type { ListItem } from '@component/ItemList';
import type { District } from '@game/data';
import { canUnlockDistrict } from '@game/districts';
import { formatCount } from '@game/format';
import type { GameState } from '@game/state';
import {
  NO_REPUTATION,
  missingConditions,
  unavailableReason,
} from '@view/purchase';

// Ligne d'un quartier à débloquer, partagée par Investir et la fiche de la
// carte de la ville.
export const districtItem = (
  state: GameState,
  district: District,
  onUnlock: () => void,
): ListItem => {
  const isOpen = state.districts.includes(district.id);
  return {
    id: district.id,
    title: district.name,
    badge: isOpen ? 'Ouvert' : undefined,
    detail: `${district.description} · ${formatCount(district.cost)} de réputation`,
    actionLabel: isOpen ? 'Ouvert' : 'Débloquer',
    isDisabled: !canUnlockDistrict(state, district.id),
    reason: unavailableReason(state, {
      isDone: isOpen,
      requirement: district.requirement,
      shortage: NO_REPUTATION,
    }),
    conditions: isOpen
      ? undefined
      : missingConditions(state, district.requirement),
    onAction: onUnlock,
  };
};
