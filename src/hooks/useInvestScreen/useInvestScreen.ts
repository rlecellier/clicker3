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
import { companies, districts, economyRules } from '@game/data';
import type { Company, Upgrade } from '@game/data';
import { canUnlockDistrict } from '@game/districts';
import {
  finalPrice,
  outputPerCopy,
  periodProduction,
  productionShares,
  salesCapacity,
} from '@game/economy';
import {
  checkRequirement,
  describeEffect,
  formatCount,
  formatDecimal,
  formatMoney,
} from '@game/format';
import { isUnlocked } from '@game/requirements';
import type { Requirement } from '@game/requirements';
import type { GameState } from '@game/state';
import {
  availableUpgrades,
  canBuyUpgrade,
  canCancelUpgrade,
  previewEffects,
  upgradeById,
} from '@game/upgrades';
import { useGameActions } from '@hook/useGameActions';

// Les prérequis à afficher en vert ou en rouge, seulement s'il en manque.
const conditionsOf = (state: GameState, requirement?: Requirement) =>
  requirement !== undefined && !isUnlocked(state, requirement)
    ? checkRequirement(state, requirement)
    : undefined;

// Pourquoi l'achat est impossible : rien si déjà fait, sinon la fin de partie,
// le déblocage manquant ou, à défaut, le manque de ressource.
const reasonOf = (
  state: GameState,
  isDone: boolean,
  requirement: Requirement | undefined,
  shortage: string,
) => {
  if (isDone) {
    return;
  }
  if (state.status === 'dead') {
    return 'Partie terminée';
  }
  return conditionsOf(state, requirement) === undefined ? shortage : undefined;
};

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
      badge: owned > 0 ? `${formatCount(owned)} possédé(s)` : undefined,
      detail: `${company.kind === 'production' ? 'Production' : 'Commerce'} · ${companyEffect(state, company)} · prochain : ${formatMoney(cost)}`,
      actionLabel: 'Acheter',
      isDisabled: !canBuy,
      reason: reasonOf(
        state,
        false,
        company.requirement,
        fitsWarehouse(state, company.id)
          ? 'Argent insuffisant'
          : 'Entrepôt trop petit : agrandissez-le d’abord',
      ),
      conditions: conditionsOf(state, company.requirement),
      onAction: () => {
        actions.buyCompany(company.id);
      },
    };
  });

  const warehouseItem: ListItem = {
    id: 'warehouse',
    title: 'Petit entrepôt',
    badge:
      state.warehouses > 0
        ? `${formatCount(state.warehouses)} possédé(s)`
        : undefined,
    detail: `Stockage · +${formatCount(economyRules.warehouse.capacity)} de capacité de stock · prochain : ${formatMoney(warehouseCost(state.warehouses))}`,
    actionLabel: 'Acheter',
    isDisabled: !canBuyWarehouse(state),
    reason: reasonOf(state, false, undefined, 'Argent insuffisant'),
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
      reason: reasonOf(state, false, upgrade.requirement, 'Argent insuffisant'),
      conditions: conditionsOf(state, upgrade.requirement),
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
      reason: state.status === 'dead' ? 'Partie terminée' : undefined,
      onAction: () => {
        actions.cancelUpgrade(upgrade.id);
      },
    }));

  const districtItems: ListItem[] = districts.map((district) => {
    const isOpen = state.districts.includes(district.id);
    return {
      id: district.id,
      title: district.name,
      badge: isOpen ? 'Ouvert' : undefined,
      detail: `${district.description} · ${formatCount(district.cost)} de réputation`,
      actionLabel: isOpen ? 'Ouvert' : 'Débloquer',
      isDisabled: !canUnlockDistrict(state, district.id),
      reason: reasonOf(
        state,
        isOpen,
        district.requirement,
        'Réputation insuffisante',
      ),
      conditions: isOpen
        ? undefined
        : conditionsOf(state, district.requirement),
      onAction: () => {
        actions.unlockDistrict(district.id);
      },
    };
  });

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
