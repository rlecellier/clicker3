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
