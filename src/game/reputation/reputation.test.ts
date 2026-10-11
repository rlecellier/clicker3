import { startState } from '@game/data';
import { deepFreeze } from '@test/deepFreeze';
import {
  canSpendReputation,
  gainReputation,
  loseReputation,
  reputationTierOf,
  spendReputation,
} from './reputation';

describe('gainReputation', () => {
  it('augmente le solde et le cumul gagné', () => {
    const next = gainReputation(startState, 7);
    expect(next.reputation).toBe(7);
    expect(next.reputationEarned).toBe(7);
  });

  it('ignore un gain nul ou négatif', () => {
    expect(gainReputation(startState, 0)).toBe(startState);
    expect(gainReputation(startState, -3)).toBe(startState);
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(startState));
    expect(() => gainReputation(frozen, 2)).not.toThrow();
  });
});

describe('loseReputation', () => {
  it('baisse le solde sans toucher au cumul gagné', () => {
    const next = loseReputation(gainReputation(startState, 10), 4);
    expect(next.reputation).toBe(6);
    expect(next.reputationEarned).toBe(10);
  });

  it('ne descend jamais sous 0', () => {
    const next = loseReputation(gainReputation(startState, 3), 50);
    expect(next.reputation).toBe(0);
  });
});

describe('spendReputation', () => {
  const rich = gainReputation(startState, 10);

  it('retire la réputation dépensée du solde, pas du cumul', () => {
    const next = spendReputation(rich, 4);
    expect(next.reputation).toBe(6);
    expect(next.reputationEarned).toBe(10);
  });

  it('refuse si la réputation est insuffisante', () => {
    expect(canSpendReputation(rich, 11)).toBe(false);
    expect(spendReputation(rich, 11)).toBe(rich);
  });

  it('accepte de dépenser exactement le solde', () => {
    expect(spendReputation(rich, 10).reputation).toBe(0);
  });
});

describe('reputationTierOf', () => {
  it('part du palier 0', () => {
    expect(reputationTierOf(startState)).toBe(0);
  });

  it('monte avec le total gagné', () => {
    expect(reputationTierOf(gainReputation(startState, 5))).toBe(0);
    expect(reputationTierOf(gainReputation(startState, 6))).toBe(1);
    expect(reputationTierOf(gainReputation(startState, 100))).toBe(2);
    expect(reputationTierOf(gainReputation(startState, 1000))).toBe(3);
  });

  it('ne redescend pas quand on dépense ou perd de la réputation', () => {
    const earned = gainReputation(startState, 100);
    expect(reputationTierOf(spendReputation(earned, 100))).toBe(2);
    expect(reputationTierOf(loseReputation(earned, 100))).toBe(2);
  });
});
