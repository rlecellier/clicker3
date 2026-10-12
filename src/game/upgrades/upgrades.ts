import { findById, startState, upgrades } from '@game/data';
import type { UpgradeEffect } from '@game/data';
import { withRecord } from '@game/ledger';
import { isRequirementMet } from '@game/requirements';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

export const upgradeById = (id: string) => findById(upgrades, id);

export const isOwned = (state: GameState, id: string) =>
  state.upgrades.includes(id);

// Effets de toutes les améliorations achetées.
export const ownedEffects = (state: GameState): UpgradeEffect[] =>
  upgrades
    .filter((upgrade) => isOwned(state, upgrade.id))
    .flatMap((upgrade) => upgrade.effects);

// Une amélioration possédée a un effet de ce genre (et qui passe le filtre).
export const ownsEffect = <Type extends UpgradeEffect['type']>(
  state: GameState,
  type: Type,
  isMatch: (effect: Extract<UpgradeEffect, { type: Type }>) => boolean = () =>
    true,
) =>
  ownedEffects(state)
    .filter(
      (effect): effect is Extract<UpgradeEffect, { type: Type }> =>
        effect.type === type,
    )
    .some((effect) => isMatch(effect));

export const hasCourse = (state: GameState, courseId: string) =>
  ownsEffect(state, 'course', (effect) => effect.courseId === courseId);

export const hasAutomation = (state: GameState, action: 'work') =>
  ownsEffect(state, 'automation', (effect) => effect.action === action);

export const hasDashboard = (state: GameState) =>
  ownsEffect(state, 'dashboard');

export const hasEmployee = (state: GameState) => ownsEffect(state, 'employee');

// Améliorations pas encore possédées, de la moins chère à la plus chère.
export const remainingUpgrades = (state: GameState) =>
  upgrades
    .filter((upgrade) => !isOwned(state, upgrade.id))
    .toSorted((first, second) => first.price - second.price);

// Champs de l'état qu'un bonus additif déplace.
type BonusField =
  | 'productionMultiplier'
  | 'salesMultiplier'
  | 'workReputationMultiplier'
  | 'reputationPerSaleMultiplier';

const addBonus = (
  state: GameState,
  fields: readonly BonusField[],
  amount: number,
): GameState => {
  const result = { ...state };
  for (const field of fields) {
    result[field] = state[field] + amount;
  }
  return result;
};

// Logement après une annulation : celui de la dernière amélioration de
// logement encore possédée, sinon le logement de départ.
const remainingHousing = (remaining: readonly string[]) => {
  const previous = upgrades
    .filter((upgrade) => remaining.includes(upgrade.id))
    .flatMap((upgrade) => upgrade.effects)
    .findLast((candidate) => candidate.type === 'housing');
  return {
    housingId: previous?.housingId ?? startState.housingId,
    sleepMultiplier: previous?.sleepMultiplier ?? startState.sleepMultiplier,
  };
};

/**
 * Applique (`sign` = 1, à l'achat) ou défait (`sign` = −1, à l'annulation) un
 * effet qui change l'état. Les bonus sont additifs, la capacité de stock est
 * multipliée : défaire, c'est l'opération inverse. `remaining` : les
 * améliorations encore possédées après une annulation. Les cursus, employés,
 * automatisations et le tableau de bord se lisent depuis les améliorations
 * possédées : ils ne changent pas l'état.
 */
const shiftEffect = (
  state: GameState,
  effect: UpgradeEffect,
  sign: 1 | -1,
  remaining: readonly string[],
): GameState => {
  switch (effect.type) {
    case 'housing': {
      return {
        ...state,
        ...(sign === 1
          ? {
              housingId: effect.housingId,
              sleepMultiplier: effect.sleepMultiplier,
            }
          : remainingHousing(remaining)),
      };
    }
    case 'stockCapacity': {
      return {
        ...state,
        stockCapacity:
          sign === 1
            ? state.stockCapacity * effect.factor
            : state.stockCapacity / effect.factor,
      };
    }
    case 'maxMarkers': {
      const maxMarkers = state.maxMarkers + sign * effect.add;
      return {
        ...state,
        maxMarkers,
        // Un cerveau qui rétrécit perd les marqueurs en trop.
        markers:
          sign === 1 ? state.markers : state.markers.slice(0, maxMarkers),
      };
    }
    case 'productionBonus': {
      const { companyId } = effect;
      return companyId === undefined
        ? addBonus(state, ['productionMultiplier'], sign * effect.bonus)
        : {
            ...state,
            companyMultipliers: {
              ...state.companyMultipliers,
              [companyId]:
                (state.companyMultipliers[companyId] ?? 1) +
                sign * effect.bonus,
            },
          };
    }
    case 'salesBonus': {
      return addBonus(state, ['salesMultiplier'], sign * effect.bonus);
    }
    case 'allBonus': {
      return addBonus(
        state,
        ['productionMultiplier', 'salesMultiplier'],
        sign * effect.bonus,
      );
    }
    case 'workReputation': {
      return addBonus(state, ['workReputationMultiplier'], sign * effect.bonus);
    }
    case 'reputationPerSale': {
      return addBonus(
        state,
        ['reputationPerSaleMultiplier'],
        sign * effect.bonus,
      );
    }
    case 'course':
    case 'employee':
    case 'automation':
    case 'dashboard': {
      return state;
    }
  }
};

const shiftEffects = (
  state: GameState,
  effects: readonly UpgradeEffect[],
  sign: 1 | -1,
  remaining: readonly string[] = state.upgrades,
): GameState => {
  let result = state;
  for (const effect of effects) {
    result = shiftEffect(result, effect, sign, remaining);
  }
  return result;
};

// L'état après les seuls effets de l'amélioration, sans prix, loyer ni salaires :
// sert à montrer la valeur finale avant d'acheter.
export const previewEffects = (state: GameState, id: string): GameState =>
  shiftEffects(state, upgradeById(id)?.effects ?? [], 1);

export const canBuyUpgrade = (state: GameState, id: string) => {
  const upgrade = upgradeById(id);
  return (
    isPlaying(state) &&
    upgrade !== undefined &&
    !isOwned(state, id) &&
    state.money >= upgrade.price &&
    isRequirementMet(state, upgrade.requirement)
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
    { purchases: upgrade.price, purchasesBy: { [id]: upgrade.price } },
  );
  return shiftEffects(bought, upgrade.effects, 1);
};

export const canCancelUpgrade = (state: GameState, id: string) =>
  isPlaying(state) && upgradeById(id) !== undefined && isOwned(state, id);

// Annule une amélioration possédée : ses effets, son loyer et ses salaires
// disparaissent, mais le prix payé n'est pas rendu. Si l'annulation est
// impossible, l'état est rendu inchangé.
export const cancelUpgrade = (state: GameState, id: string): GameState => {
  const upgrade = upgradeById(id);
  if (upgrade === undefined || !canCancelUpgrade(state, id)) {
    return state;
  }
  const remaining = state.upgrades.filter((owned) => owned !== id);
  return shiftEffects(
    {
      ...state,
      rent: state.rent - (upgrade.rent ?? 0),
      payroll: state.payroll - (upgrade.payroll ?? 0),
      upgrades: remaining,
    },
    upgrade.effects,
    -1,
    remaining,
  );
};

// Prochaine amélioration à viser : la moins chère déjà débloquée, sinon la
// moins chère avec ce qui lui manque. `undefined` s'il n'y en a plus.
export const nextUpgrade = (state: GameState) => {
  const remaining = remainingUpgrades(state);
  return (
    remaining.find((upgrade) => isRequirementMet(state, upgrade.requirement)) ??
    remaining[0]
  );
};

// Améliorations à proposer : toutes celles déjà débloquées (de la moins chère à
// la plus chère), plus la moins chère encore verrouillée pour montrer la suite.
export const availableUpgrades = (state: GameState) => {
  const remaining = remainingUpgrades(state);
  const isOpen = (upgrade: (typeof upgrades)[number]) =>
    isRequirementMet(state, upgrade.requirement);
  const locked = remaining.find((upgrade) => !isOpen(upgrade));
  return [
    ...remaining.filter((upgrade) => isOpen(upgrade)),
    ...(locked === undefined ? [] : [locked]),
  ];
};
