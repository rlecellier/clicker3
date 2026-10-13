import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { placements } from '@game/data';
import { formatDecimal, formatMoney } from '@game/format';
import {
  capitalOf,
  ceilingOf,
  depositable,
  expectedYield,
  isPlacementUnlocked,
  rateOf,
} from '@game/placements';
import { isPlaying } from '@game/state';
import { useGameActions } from '@hook/useGameActions';
import { missingConditions } from '@view/purchase';

const percent = (rate: number) => `${formatDecimal(rate * 100)} %`;

// « Rend 0,3 % par mois », avec le signe quand un événement le fait baisser.
const rateLabel = (rate: number) =>
  rate < 0
    ? `perd ${percent(-rate)} par mois`
    : `rend ${percent(rate)} par mois`;

// Comptes et placements : l'argent du compte courant se répartit, se reprend
// à tout moment et rapporte à chaque période.
export const useFinanceScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();
  const isOpen = isPlaying(state);

  const items: ListItem[] = placements.map((placement) => {
    const placed = state.placements[placement.id];
    const ceiling = ceilingOf(state, placement.id);
    const room = depositable(state, placement.id);
    const isUnlocked = isPlacementUnlocked(state, placement.id);
    const reason = ((): string | undefined => {
      if (!isUnlocked || room > 0) {
        return undefined;
      }
      return placed >= ceiling
        ? 'Plafond atteint : montez en réputation pour placer davantage'
        : 'Pas d’argent à placer';
    })();
    return {
      id: placement.id,
      title: placement.name,
      badge: placed > 0 ? formatMoney(placed) : undefined,
      detail: isUnlocked
        ? `${placement.description} Ce placement ${rateLabel(rateOf(state, placement))} · plafond ${formatMoney(ceiling)}`
        : placement.description,
      actionLabel: 'Placer tout',
      isDisabled: !isOpen || room <= 0,
      reason,
      conditions: missingConditions(state, placement.requirement),
      onAction: () => {
        actions.deposit(placement.id, room);
      },
      extraActions: isUnlocked
        ? [
            {
              id: 'half',
              label: 'Placer la moitié',
              isDisabled: !isOpen || Math.floor(room / 2) <= 0,
              onAction: () => {
                actions.deposit(placement.id, Math.floor(room / 2));
              },
            },
            {
              id: 'withdraw',
              label: 'Retirer tout',
              isDisabled: !isOpen || placed <= 0,
              onAction: () => {
                actions.withdraw(placement.id, placed);
              },
            },
          ]
        : undefined,
    };
  });

  return {
    checking: formatMoney(state.money),
    capital: formatMoney(capitalOf(state)),
    yield: formatMoney(expectedYield(state)),
    items,
  };
};
