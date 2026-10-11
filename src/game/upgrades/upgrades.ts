import { upgrades } from '@game/data';
import type { UpgradeEffect } from '@game/data';
import { withRecord } from '@game/ledger';
import { isUnlocked } from '@game/requirements';
import type { GameState } from '@game/state';

export const upgradeById = (id: string) =>
  upgrades.find((candidate) => candidate.id === id);

export const isOwned = (state: GameState, id: string) =>
  state.upgrades.includes(id);

// Effets de toutes les améliorations achetées.
export const ownedEffects = (state: GameState): UpgradeEffect[] =>
  upgrades
    .filter((upgrade) => isOwned(state, upgrade.id))
    .flatMap((upgrade) => upgrade.effects);

export const hasCourse = (state: GameState, courseId: string) =>
  ownedEffects(state).some(
    (effect) => effect.type === 'course' && effect.courseId === courseId,
  );

export const hasAutomation = (state: GameState, action: 'work' | 'sleep') =>
  ownedEffects(state).some(
    (effect) => effect.type === 'automation' && effect.action === action,
  );

export const hasDashboard = (state: GameState) =>
  ownedEffects(state).some((effect) => effect.type === 'dashboard');

// Effets qui changent l'état à l'achat. Les cursus, employés, automatisations
// et le tableau de bord se lisent depuis les améliorations possédées.
const applyEffect = (state: GameState, effect: UpgradeEffect): GameState => {
  switch (effect.type) {
    case 'housing': {
      return {
        ...state,
        housingId: effect.housingId,
        sleepMultiplier: effect.sleepMultiplier,
      };
    }
    case 'stockCapacity': {
      return { ...state, stockCapacity: state.stockCapacity * effect.factor };
    }
    case 'maxMarkers': {
      return { ...state, maxMarkers: state.maxMarkers + effect.add };
    }
    case 'productionBonus': {
      return effect.companyId === undefined
        ? {
            ...state,
            productionMultiplier: state.productionMultiplier + effect.bonus,
          }
        : {
            ...state,
            companyMultipliers: {
              ...state.companyMultipliers,
              [effect.companyId]:
                (state.companyMultipliers[effect.companyId] ?? 1) +
                effect.bonus,
            },
          };
    }
    case 'salesBonus': {
      return {
        ...state,
        salesMultiplier: state.salesMultiplier + effect.bonus,
      };
    }
    case 'allBonus': {
      return {
        ...state,
        productionMultiplier: state.productionMultiplier + effect.bonus,
        salesMultiplier: state.salesMultiplier + effect.bonus,
      };
    }
    case 'workReputation': {
      return {
        ...state,
        workReputationMultiplier: state.workReputationMultiplier + effect.bonus,
      };
    }
    case 'reputationPerSale': {
      return {
        ...state,
        reputationPerSaleMultiplier:
          state.reputationPerSaleMultiplier + effect.bonus,
      };
    }
    case 'course':
    case 'employee':
    case 'automation':
    case 'dashboard': {
      return state;
    }
  }
};

export const canBuyUpgrade = (state: GameState, id: string) => {
  const upgrade = upgradeById(id);
  return (
    state.status === 'playing' &&
    upgrade !== undefined &&
    !isOwned(state, id) &&
    state.money >= upgrade.price &&
    (upgrade.requirement === undefined ||
      isUnlocked(state, upgrade.requirement))
  );
};

// Si l'achat est impossible, l'état est rendu inchangé.
export const buyUpgrade = (state: GameState, id: string): GameState => {
  const upgrade = upgradeById(id);
  if (upgrade === undefined || !canBuyUpgrade(state, id)) {
    return state;
  }
  const bought = withRecord(
    {
      ...state,
      money: state.money - upgrade.price,
      rent: state.rent + (upgrade.rent ?? 0),
      payroll: state.payroll + (upgrade.payroll ?? 0),
      upgrades: [...state.upgrades, id],
    },
    { purchases: upgrade.price },
  );
  let result = bought;
  for (const effect of upgrade.effects) {
    result = applyEffect(result, effect);
  }
  return result;
};
