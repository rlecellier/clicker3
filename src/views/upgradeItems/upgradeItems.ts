import type { ListItem } from '@component/ItemList';
import { boostById, canBuyBoost, isBoostActive } from '@game/boosts';
import { boosts } from '@game/data';
import type { Upgrade } from '@game/data';
import { periodProduction } from '@game/economy';
import {
  describeBoost,
  describeEffect,
  formatCount,
  formatMoney,
} from '@game/format';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';
import {
  canBuyUpgrade,
  canCancelUpgrade,
  previewEffects,
  upgradeById,
} from '@game/upgrades';
import {
  ENDED,
  NO_MONEY,
  missingConditions,
  unavailableReason,
} from '@view/purchase';

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

// Ligne d'une amélioration à acheter : la même dans la liste globale et dans
// les vues contextuelles de Profil et d'Entreprises.
export const upgradeItem = (
  state: GameState,
  upgrade: Upgrade,
  onBuy: (id: string) => void,
): ListItem => ({
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
    onBuy(upgrade.id);
  },
});

// Les améliorations obtenues, dans l'ordre d'achat : on peut les annuler,
// sans rien récupérer.
export const ownedUpgradeItems = (
  state: GameState,
  onCancel: (id: string) => void,
): ListItem[] =>
  state.upgrades
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
        onCancel(upgrade.id);
      },
    }));

// Coups de pouce : achetables à nouveau une fois l'effet écoulé.
export const boostItems = (
  state: GameState,
  onBuy: (id: string) => void,
): ListItem[] =>
  boosts.map((boost) => {
    const active = state.activeEffects.find(
      (effect) => effect.eventId === boost.id && effect.until > state.period,
    );
    return {
      id: boost.id,
      title: boost.name,
      badge:
        active === undefined
          ? undefined
          : `Actif, encore ${formatCount(active.until - state.period)} mois`,
      effects: [describeBoost(boost)],
      detail: [boost.description, formatMoney(boost.price)].join(' · '),
      actionLabel: 'Acheter',
      isDisabled: !canBuyBoost(state, boost.id),
      reason: isBoostActive(state, boost.id)
        ? 'Déjà actif'
        : unavailableReason(state, {
            requirement: boostById(boost.id)?.requirement,
            shortage: NO_MONEY,
          }),
      conditions: missingConditions(state, boost.requirement),
      onAction: () => {
        onBuy(boost.id);
      },
    };
  });
