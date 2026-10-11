import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { activeBonus, expireEffects } from './effects';

const withEffects = (period: number): GameState => ({
  ...startState,
  period,
  activeEffects: [
    { eventId: 'a', kind: 'sales', value: 0.2, until: 10 },
    { eventId: 'b', kind: 'sales', value: 0.1, until: 20 },
    { eventId: 'c', kind: 'workSlow', value: 0.5, until: 20 },
  ],
});

describe('activeBonus', () => {
  it('additionne les effets actifs du genre demandé', () => {
    expect(activeBonus(withEffects(5), 'sales')).toBeCloseTo(0.3);
    expect(activeBonus(withEffects(5), 'workSlow')).toBe(0.5);
  });

  it('ignore les effets arrivés à échéance', () => {
    expect(activeBonus(withEffects(10), 'sales')).toBeCloseTo(0.1);
    expect(activeBonus(withEffects(20), 'sales')).toBe(0);
  });
});

describe('expireEffects', () => {
  it('retire les effets échus', () => {
    expect(expireEffects(withEffects(10)).activeEffects).toHaveLength(2);
  });

  it('rend le même état quand rien n’expire', () => {
    const state = withEffects(5);
    expect(expireEffects(state)).toBe(state);
  });
});
