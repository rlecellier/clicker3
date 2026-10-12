import { economyRules, findById, startState, upgrades } from '@game/data';
import type { Upgrade, UpgradeEffect } from '@game/data';
import type { GameState } from '@game/state';

// Champs de l'état qui découlent des améliorations possédées, des petits
// entrepôts et des facteurs d'événements. Ils ne s'écrivent nulle part
// ailleurs que dans `withModifiers`.
export type DerivedFields = Pick<
  GameState,
  | 'productionMultiplier'
  | 'salesMultiplier'
  | 'companyMultipliers'
  | 'workReputationMultiplier'
  | 'reputationPerSaleMultiplier'
  | 'stockCapacity'
  | 'maxMarkers'
  | 'housingId'
  | 'sleepMultiplier'
  | 'rent'
  | 'payroll'
>;

// Améliorations possédées, dans l'ordre d'achat.
const ownedUpgrades = (state: GameState): Upgrade[] =>
  state.upgrades
    .map((id) => findById(upgrades, id))
    .filter((upgrade) => upgrade !== undefined);

// Multiplicateur de capacité de l'entrepôt (produit des agrandissements).
export const stockCapacityFactor = (state: GameState) => {
  let factor = 1;
  for (const upgrade of ownedUpgrades(state)) {
    for (const effect of upgrade.effects) {
      if (effect.type === 'stockCapacity') {
        factor *= effect.factor;
      }
    }
  }
  return factor;
};

// Capacité qu'apporte un petit entrepôt, agrandissements compris.
export const warehouseCapacity = (state: GameState) =>
  economyRules.warehouse.capacity * stockCapacityFactor(state);

// Ajoute l'effet d'une amélioration possédée aux valeurs en cours de calcul.
const addEffect = (derived: DerivedFields, effect: UpgradeEffect) => {
  switch (effect.type) {
    case 'housing': {
      derived.housingId = effect.housingId;
      derived.sleepMultiplier = effect.sleepMultiplier;
      return;
    }
    case 'maxMarkers': {
      derived.maxMarkers += effect.add;
      return;
    }
    case 'productionBonus': {
      if (effect.companyId === undefined) {
        derived.productionMultiplier += effect.bonus;
      } else {
        derived.companyMultipliers[effect.companyId] =
          (derived.companyMultipliers[effect.companyId] ?? 1) + effect.bonus;
      }
      return;
    }
    case 'salesBonus': {
      derived.salesMultiplier += effect.bonus;
      return;
    }
    case 'allBonus': {
      derived.productionMultiplier += effect.bonus;
      derived.salesMultiplier += effect.bonus;
      return;
    }
    case 'workReputation': {
      derived.workReputationMultiplier += effect.bonus;
      return;
    }
    case 'reputationPerSale': {
      derived.reputationPerSaleMultiplier += effect.bonus;
      return;
    }
    case 'stockCapacity':
    case 'markerChance':
    case 'course':
    case 'employee':
    case 'automation':
    case 'dashboard': {
      return;
    }
  }
};

/**
 * Valeurs dérivées, recalculées depuis l'état de départ : améliorations
 * possédées (bonus additifs dans l'ordre d'achat, logement de la dernière
 * achetée), petits entrepôts, et facteurs de loyer et de salaires des
 * événements. Ni achat ni annulation ne « défont » un effet à l'envers : on
 * recalcule tout, l'ordre des achats ne change donc pas le résultat.
 *
 * La capacité de stock vaut (départ + petits entrepôts) × agrandissements ;
 * le loyer et les salaires, (départ + améliorations) × facteurs, arrondis.
 */
export const derivedFields = (state: GameState): DerivedFields => {
  const derived: DerivedFields = {
    productionMultiplier: startState.productionMultiplier,
    salesMultiplier: startState.salesMultiplier,
    companyMultipliers: {},
    workReputationMultiplier: startState.workReputationMultiplier,
    reputationPerSaleMultiplier: startState.reputationPerSaleMultiplier,
    stockCapacity: 0,
    maxMarkers: startState.maxMarkers,
    housingId: startState.housingId,
    sleepMultiplier: startState.sleepMultiplier,
    rent: 0,
    payroll: 0,
  };
  let rent = startState.rent;
  let payroll = startState.payroll;
  for (const upgrade of ownedUpgrades(state)) {
    rent += upgrade.rent ?? 0;
    payroll += upgrade.payroll ?? 0;
    for (const effect of upgrade.effects) {
      addEffect(derived, effect);
    }
  }
  derived.stockCapacity =
    (startState.stockCapacity +
      state.warehouses * economyRules.warehouse.capacity) *
    stockCapacityFactor(state);
  derived.rent = Math.round(rent * state.rentFactor);
  derived.payroll = Math.round(payroll * state.payrollFactor);
  return derived;
};

// L'état avec ses valeurs dérivées à jour. Un cerveau qui rétrécit perd les
// marqueurs en trop.
export const withModifiers = (state: GameState): GameState => {
  const derived = derivedFields(state);
  return {
    ...state,
    ...derived,
    markers:
      state.markers.length > derived.maxMarkers
        ? state.markers.slice(0, derived.maxMarkers)
        : state.markers,
  };
};
