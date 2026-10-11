import { reputationTiers } from '@game/data';
import { withRecord } from '@game/ledger';
import type { GameState } from '@game/state';

export const gainReputation = (state: GameState, amount: number) =>
  amount > 0
    ? withRecord(
        {
          ...state,
          reputation: state.reputation + amount,
          reputationEarned: state.reputationEarned + amount,
        },
        { reputationGained: amount },
      )
    : state;

// La réputation ne descend jamais sous 0 ; le cumul gagné ne bouge pas.
export const loseReputation = (state: GameState, amount: number) => {
  if (amount <= 0) {
    return state;
  }
  const reputation = Math.max(0, state.reputation - amount);
  return withRecord(
    { ...state, reputation },
    { reputationLost: state.reputation - reputation },
  );
};

export const canSpendReputation = (state: GameState, amount: number) =>
  amount >= 0 && state.reputation >= amount;

// Si la réputation est insuffisante, l'état est rendu inchangé.
export const spendReputation = (state: GameState, amount: number) =>
  amount > 0 && canSpendReputation(state, amount)
    ? withRecord(
        { ...state, reputation: state.reputation - amount },
        { reputationSpent: amount },
      )
    : state;

// Palier d'après le total gagné : 0 (« Inconnu ») à 3.
export const reputationTierOf = (state: GameState) =>
  reputationTiers.filter((tier) => state.reputationEarned >= tier.earned)
    .length - 1;

// Progression dans le palier courant, sur le total gagné (jamais sur le solde).
// Au dernier palier : value = max = 1, comme pour les compétences.
export const reputationTierProgress = (state: GameState) => {
  const tier = reputationTierOf(state);
  const start = reputationTiers[tier]?.earned ?? 0;
  const next = reputationTiers[tier + 1];
  return {
    tier,
    name: reputationTiers[tier]?.name ?? '',
    value: next === undefined ? 1 : state.reputationEarned - start,
    max: next === undefined ? 1 : next.earned - start,
    isMax: next === undefined,
  };
};
