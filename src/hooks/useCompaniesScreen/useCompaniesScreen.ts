import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import {
  canBuyCompany,
  canBuyWarehouse,
  companyCost,
  fitsWarehouse,
  isCompanyMaxed,
  ownedCount,
  warehouseCost,
} from '@game/companies';
import { companies, districts, impactRules } from '@game/data';
import type { Company } from '@game/data';
import {
  finalPrice,
  outputPerCopy,
  productionShares,
  salesCapacity,
} from '@game/economy';
import { formatCount, formatDecimal, formatMoney } from '@game/format';
import type { GameState } from '@game/state';
import { availableUpgrades, warehouseCapacity } from '@game/upgrades';
import { useGameActions } from '@hook/useGameActions';
import { districtItem } from '@view/districtItem';
import { upgradeItem } from '@view/upgradeItems';
import {
  NO_MONEY,
  missingConditions,
  ownedBadge,
  unavailableReason,
} from '@view/purchase';

const stockLabel = (state: GameState) => {
  if (state.lastStatement?.stockout === true) {
    return 'en rupture';
  }
  if (state.stock >= state.stockCapacity) {
    return 'plein';
  }
  return state.stock === 0 ? 'vide' : 'en cours';
};

const districtNameOf = (company: Company) =>
  districts.find(
    (district) => district.id === impactRules.companyDistricts[company.id],
  )?.name ?? 'Les Tilleuls';

// Ce qui manque quand tout est débloqué : la place, l'entrepôt ou l'argent.
const shortageOf = (state: GameState, company: Company) => {
  if (isCompanyMaxed(state, company.id)) {
    return 'Quartier complet : montez en gamme';
  }
  return fitsWarehouse(state, company.id)
    ? NO_MONEY
    : 'Entrepôt trop petit : agrandissez-le d’abord';
};

// Valeur finale (tous modificateurs appliqués), par exemplaire puis au total ;
// le total arrondi est celui du moteur, jamais la base de l'entreprise.
const companyEffect = (state: GameState, company: Company) => {
  const owned = ownedCount(state, company.id);
  const perCopy = formatDecimal(outputPerCopy(state, company));
  const total =
    company.kind === 'production'
      ? (productionShares(state)[company.id] ?? 0)
      : salesCapacity(state, company);
  const verb = company.kind === 'production' ? 'Produit' : 'Vend jusqu’à';
  const price =
    company.kind === 'commerce'
      ? ` à ${formatDecimal(finalPrice(state, company))} €`
      : '';
  return owned === 0
    ? `${verb} ${perCopy} articles par période et par exemplaire${price}`
    : `${verb} ${formatCount(total)} articles par période (${formatCount(owned)} × ${perCopy})${price}`;
};

// Achats d'entreprises et d'entrepôts, et déblocage de quartiers.
export const useCompaniesScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();

  const companyItems: ListItem[] = companies.map((company) => {
    const owned = ownedCount(state, company.id);
    const cost = companyCost(company.id, owned);
    const canBuy = canBuyCompany(state, company.id);
    const isMaxed = isCompanyMaxed(state, company.id);
    return {
      id: company.id,
      title: company.name,
      badge: ownedBadge(owned),
      detail: [
        company.kind === 'production' ? 'Production' : 'Commerce',
        companyEffect(state, company),
        isMaxed ? 'plus de place' : `prochain apport : ${formatMoney(cost)}`,
        company.charges === 0
          ? undefined
          : `charges +${formatMoney(company.charges)} par mois et par exemplaire`,
        `${districtNameOf(company)} : ${formatCount(owned)} / ${formatCount(company.maxCopies)}`,
      ]
        .filter((part) => part !== undefined)
        .join(' · '),
      actionLabel: 'Acheter',
      isDisabled: !canBuy,
      reason: unavailableReason(state, {
        requirement: company.requirement,
        shortage: shortageOf(state, company),
      }),
      conditions: missingConditions(state, company.requirement),
      onAction: () => {
        actions.buyCompany(company.id);
      },
    };
  });

  const warehouseItem: ListItem = {
    id: 'warehouse',
    title: 'Petit entrepôt',
    badge: ownedBadge(state.warehouses),
    detail: `Stockage · +${formatCount(warehouseCapacity(state))} de capacité de stock · prochain : ${formatMoney(warehouseCost(state.warehouses))}`,
    actionLabel: 'Acheter',
    isDisabled: !canBuyWarehouse(state),
    reason: unavailableReason(state, { shortage: NO_MONEY }),
    onAction: () => {
      actions.buyWarehouse();
    },
  };

  const districtItems: ListItem[] = districts.map((district) =>
    districtItem(state, district, () => {
      actions.unlockDistrict(district.id);
    }),
  );

  return {
    stock: {
      label: `Entrepôt : ${stockLabel(state)} (${formatCount(state.stock)} / ${formatCount(state.stockCapacity)})`,
      value: state.stock,
      max: state.stockCapacity,
    },
    companies: [...companyItems, warehouseItem],
    districts: districtItems,
    // Les améliorations qui touchent les entreprises, achetables d'ici.
    upgrades: availableUpgrades(state, 'company').map((upgrade) =>
      upgradeItem(state, upgrade, actions.buyUpgrade),
    ),
  };
};
