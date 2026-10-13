import type { InfoListItem, ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { placements } from '@game/data';
import { formatDecimal, formatMoney } from '@game/format';
import {
  bufferOf,
  capitalOf,
  checkingOf,
  expectedYield,
  isPlacementEligible,
  isPlacementOpen,
  rateOf,
} from '@game/placements';
import { useBankerAppointment } from '@hook/useBankerAppointment';
import { missingConditions } from '@view/purchase';

const percent = (rate: number) => `${formatDecimal(rate * 100)} %`;

const ceilingLabel = (ceiling: number) =>
  Number.isFinite(ceiling) ? `plafond ${formatMoney(ceiling)}` : 'sans plafond';

// « Rend 0,3 % par mois », avec le signe quand un événement le fait baisser.
const rateLabel = (rate: number) =>
  rate < 0
    ? `perd ${percent(-rate)} par mois`
    : `rend ${percent(rate)} par mois`;

// Comptes : la répartition est automatique (le compte courant garde son
// matelas, le surplus remplit les comptes dans l'ordre), l'écran la montre.
export const useFinanceScreen = () => {
  const { state } = useGameContext();
  const { dialog, start } = useBankerAppointment();

  const items: (InfoListItem | ListItem)[] = placements.map((placement) => {
    const placed = state.placements[placement.id];
    const isOpen = isPlacementOpen(state, placement.id);
    const base = {
      id: placement.id,
      title: placement.name,
      badge: placed > 0 ? formatMoney(placed) : undefined,
      detail: isOpen
        ? `${placement.description} Ce compte ${rateLabel(rateOf(state, placement))} · ${ceilingLabel(placement.ceiling)}`
        : placement.description,
      conditions: missingConditions(state, placement.requirement),
    };
    // La réputation suffit, mais le compte reste à ouvrir chez le banquier.
    return !isOpen && isPlacementEligible(state, placement.id)
      ? {
          ...base,
          detail: `${placement.description} Votre conseiller peut vous recevoir.`,
          actionLabel: 'Prendre rendez-vous',
          isDisabled: false,
          onAction: () => {
            start(placement.id);
          },
        }
      : base;
  });

  return {
    total: formatMoney(state.money),
    checking: formatMoney(checkingOf(state)),
    buffer: formatMoney(bufferOf(state)),
    capital: formatMoney(capitalOf(state)),
    yield: formatMoney(expectedYield(state)),
    items,
    dialog,
  };
};
