import type { InfoListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { placements } from '@game/data';
import { formatDecimal, formatMoney } from '@game/format';
import {
  bufferOf,
  capitalOf,
  ceilingOf,
  checkingOf,
  expectedYield,
  isPlacementUnlocked,
  rateOf,
} from '@game/placements';
import { missingConditions } from '@view/purchase';

const percent = (rate: number) => `${formatDecimal(rate * 100)} %`;

// « Rend 0,3 % par mois », avec le signe quand un événement le fait baisser.
const rateLabel = (rate: number) =>
  rate < 0
    ? `perd ${percent(-rate)} par mois`
    : `rend ${percent(rate)} par mois`;

// Comptes : la répartition est automatique (le compte courant garde son
// matelas, le surplus remplit les comptes dans l'ordre), l'écran la montre.
export const useFinanceScreen = () => {
  const { state } = useGameContext();

  const items: InfoListItem[] = placements.map((placement) => {
    const placed = state.placements[placement.id];
    const isUnlocked = isPlacementUnlocked(state, placement.id);
    return {
      id: placement.id,
      title: placement.name,
      badge: placed > 0 ? formatMoney(placed) : undefined,
      detail: isUnlocked
        ? `${placement.description} Ce compte ${rateLabel(rateOf(state, placement))} · plafond ${formatMoney(ceilingOf(state, placement.id))}`
        : placement.description,
      conditions: missingConditions(state, placement.requirement),
    };
  });

  return {
    total: formatMoney(state.money),
    checking: formatMoney(checkingOf(state)),
    buffer: formatMoney(bufferOf(state)),
    capital: formatMoney(capitalOf(state)),
    yield: formatMoney(expectedYield(state)),
    items,
  };
};
