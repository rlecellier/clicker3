import { economyRules, startState } from '@game/data';
import { sellSurplus } from './surplus';

describe('sellSurplus', () => {
  const stocked = { ...startState, stock: 20 };

  it('vend tout le stock à bas prix', () => {
    const next = sellSurplus(stocked);
    expect(next.stock).toBe(0);
    expect(next.money).toBe(20 * economyRules.surplusPrice);
  });

  it('prend un peu de temps', () => {
    expect(sellSurplus(stocked).gauge).toBe(economyRules.surplusMinutes);
  });

  it('refuse sans stock ou quand le personnage est mort', () => {
    expect(sellSurplus(startState)).toBe(startState);
    const dead = { ...stocked, status: 'dead' as const };
    expect(sellSurplus(dead)).toBe(dead);
  });
});
