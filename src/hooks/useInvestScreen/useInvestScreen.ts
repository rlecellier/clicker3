import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import {
  canBuyCompany,
  canBuyWarehouse,
  companyCost,
  fitsWarehouse,
  ownedCount,
  warehouseCost,
} from '@game/companies';
import { companies, districts } from '@game/data';
import type { Company, Upgrade } from '@game/data';
import {
  finalPrice,
  outputPerCopy,
  periodProduction,
  productionShares,
  salesCapacity,
} from '@game/economy';
import {
  describeEffect,
  formatCount,
  formatDecimal,
  formatMoney,
} from '@game/format';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';
import {
  availableUpgrades,
  canBuyUpgrade,
  canCancelUpgrade,
  previewEffects,
  upgradeById,
  warehouseCapacity,
} from '@game/upgrades';
import { useGameActions } from '@hook/useGameActions';
import { districtItem } from '@view/districtItem';
import {
  ENDED,
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

// Effet chiffré d'une amélioration, plus la production avant / après achat
// quand elle change.
const effectsOf = (state: GameState, upgrade: Upgrade) => {
  const before = periodProduction(state);
  const after = periodProduction(previewEffects(state, upgrade.id));
  return [
    ...upgrade.effects.map((effect) => describeEffect(effect)),
    ...(after === before
      ? []
      : [
          `Production : ${formatCount(before)} → ${formatCount(after)} articles par période`,
        ]),
  ];
};

const extraOf = (upgrade: Upgrade) =>
  [
    upgrade.rent === undefined
      ? undefined
      : `loyer +${formatMoney(upgrade.rent)}`,
    upgrade.payroll === undefined
      ? undefined
      : `salaires +${formatMoney(upgrade.payroll)}`,
  ].filter((part) => part !== undefined);

// Achats d'entreprises, d'améliorations et déblocage de quartiers.
export const useInvestScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();

  const companyItems: ListItem[] = companies.map((company) => {
    const owned = ownedCount(state, company.id);
    const cost = companyCost(company.id, owned);
    const canBuy = canBuyCompany(state, company.id);
    return {
      id: company.id,
      title: company.name,
      badge: ownedBadge(owned),
      detail: `${company.kind === 'production' ? 'Production' : 'Commerce'} · ${companyEffect(state, company)} · prochain : ${formatMoney(cost)}`,
      actionLabel: 'Acheter',
      isDisabled: !canBuy,
      reason: unavailableReason(state, {
        requirement: company.requirement,
        shortage: fitsWarehouse(state, company.id)
          ? NO_MONEY
          : 'Entrepôt trop petit : agrandissez-le d’abord',
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

  // Toutes les améliorations disponibles, plus la prochaine indisponible.
  const availableUpgradeItems: ListItem[] = availableUpgrades(state).map(
    (upgrade) => ({
      id: upgrade.id,
      title: upgrade.name,
      effects: effectsOf(state, upgrade),
      detail: [
        upgrade.description,
        formatMoney(upgrade.price),
        ...extraOf(upgrade),
      ].join(' · '),
      actionLabel: 'Acheter',
      isDisabled: !canBuyUpgrade(state, upgrade.id),
      reason: unavailableReason(state, {
        requirement: upgrade.requirement,
        shortage: NO_MONEY,
      }),
      conditions: missingConditions(state, upgrade.requirement),
      onAction: () => {
        actions.buyUpgrade(upgrade.id);
      },
    }),
  );

  // Les améliorations obtenues, dans l'ordre d'achat : on peut les annuler,
  // sans rien récupérer.
  const ownedUpgradeItems: ListItem[] = state.upgrades
    .map((id) => upgradeById(id))
    .filter((upgrade) => upgrade !== undefined)
    .map((upgrade) => ({
      id: upgrade.id,
      title: upgrade.name,
      effects: upgrade.effects.map((effect) => describeEffect(effect)),
      detail: [upgrade.description, ...extraOf(upgrade)].join(' · '),
      actionLabel: 'Annuler',
      isDisabled: !canCancelUpgrade(state, upgrade.id),
      reason: isPlaying(state) ? undefined : ENDED,
      onAction: () => {
        actions.cancelUpgrade(upgrade.id);
      },
    }));

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
    availableUpgrades: availableUpgradeItems,
    ownedUpgrades: ownedUpgradeItems,
    districts: districtItems,
  };
};
