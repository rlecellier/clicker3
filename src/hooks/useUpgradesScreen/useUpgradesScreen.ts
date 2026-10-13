import { useGameContext } from '@context/GameContext';
import { availableUpgrades } from '@game/upgrades';
import { useGameActions } from '@hook/useGameActions';
import { boostItems, ownedUpgradeItems, upgradeItem } from '@view/upgradeItems';

// Toutes les améliorations : celles à acheter, les coups de pouce temporaires
// et celles déjà obtenues.
export const useUpgradesScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();

  return {
    // Toutes les disponibles, plus la prochaine indisponible.
    available: availableUpgrades(state).map((upgrade) =>
      upgradeItem(state, upgrade, actions.buyUpgrade),
    ),
    boosts: boostItems(state, actions.buyBoost),
    owned: ownedUpgradeItems(state, actions.cancelUpgrade),
  };
};
