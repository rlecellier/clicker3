import type { FigureItem } from '@component/FigureList';
import { useGameContext } from '@context/GameContext';
import { FINAL_UPGRADE_ID, isFinalUpgradePending } from '@game/finale';
import { formatMoney } from '@game/format';
import { upgradeById } from '@game/upgrades';

// Pop-up du bout du bout : la dernière amélioration, la plus chère, vient
// d'être achetée. Null tant qu'elle ne l'est pas, ou une fois lue.
export const useFinalUpgradePrompt = () => {
  const { state, dispatch } = useGameContext();
  const upgrade = upgradeById(FINAL_UPGRADE_ID);
  if (upgrade === undefined || !isFinalUpgradePending(state)) {
    return null;
  }
  const bonus =
    upgrade.effects.find((effect) => effect.type === 'companyBonus')?.bonus ??
    0;
  return {
    title: 'Jusqu’au bout',
    message: `${upgrade.name} : vous avez acheté la toute dernière amélioration. Il n’y a plus rien à acheter. Toute une fortune pour un gain à peine visible. C’est cela, le capitalisme.`,
    figures: [
      { label: 'Prix payé', value: formatMoney(upgrade.price) },
      { label: 'Productivité gagnée', value: `+${Math.round(bonus * 100)} %` },
    ] satisfies FigureItem[],
    buttonLabel: 'Merci, la direction',
    onClose: () => {
      dispatch({ type: 'acknowledgeFinalUpgrade' });
    },
  };
};
