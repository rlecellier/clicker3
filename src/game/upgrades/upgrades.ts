import { findById, upgrades } from '@game/data';
import type { UpgradeEffect, UpgradeScope } from '@game/data';
import { withRecord } from '@game/ledger';
import { isRequirementMet } from '@game/requirements';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';
import { withModifiers } from './modifiers';

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

// Chance de marqueur relevée par les améliorations possédées (0,3 : + 30 %).
export const markerChanceBonus = (state: GameState) => {
  let total = 0;
  for (const effect of ownedEffects(state)) {
    if (effect.type === 'markerChance') {
      total += effect.bonus;
    }
  }
  return total;
};

export const hasCourse = (state: GameState, courseId: string) =>
  ownsEffect(state, 'course', (effect) => effect.courseId === courseId);

export const hasAutomation = (state: GameState, action: 'work') =>
  ownsEffect(state, 'automation', (effect) => effect.action === action);

export const hasDashboard = (state: GameState) =>
  ownsEffect(state, 'dashboard');

export const hasEmployee = (state: GameState) => ownsEffect(state, 'employee');

// Améliorations pas encore possédées, de la moins chère à la plus chère ; la
// portée limite la liste à celles de la personne ou des entreprises.
export const remainingUpgrades = (state: GameState, scope?: UpgradeScope) =>
  upgrades
    .filter(
      (upgrade) =>
        !isOwned(state, upgrade.id) &&
        (scope === undefined || upgrade.scope === scope),
    )
    .toSorted((first, second) => first.price - second.price);

// L'état si l'amélioration était possédée, sans en payer le prix : sert à
// montrer la valeur finale avant d'acheter.
export const previewEffects = (state: GameState, id: string): GameState =>
  isOwned(state, id) || upgradeById(id) === undefined
    ? state
    : withModifiers({ ...state, upgrades: [...state.upgrades, id] });

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
  return withModifiers(
    withRecord(
      {
        ...state,
        money: state.money - upgrade.price,
        upgrades: [...state.upgrades, id],
      },
      { purchases: upgrade.price, purchasesBy: { [id]: upgrade.price } },
    ),
  );
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
  return withModifiers({
    ...state,
    upgrades: state.upgrades.filter((owned) => owned !== id),
  });
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
// Avec une portée, la « suite » est celle de cette portée.
export const availableUpgrades = (state: GameState, scope?: UpgradeScope) => {
  const remaining = remainingUpgrades(state, scope);
  const isOpen = (upgrade: (typeof upgrades)[number]) =>
    isRequirementMet(state, upgrade.requirement);
  const locked = remaining.find((upgrade) => !isOpen(upgrade));
  return [
    ...remaining.filter((upgrade) => isOpen(upgrade)),
    ...(locked === undefined ? [] : [locked]),
  ];
};
