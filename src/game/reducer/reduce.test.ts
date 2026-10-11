import { startState } from '@game/data';
import { reduce } from './reduce';

describe('reduce', () => {
  it('applique addGauge', () => {
    const next = reduce(startState, { type: 'addGauge', amount: 250 });
    expect(next.period).toBe(2);
    expect(next.gauge).toBe(50);
  });

  it('laisse l’état d’origine intact', () => {
    const before = structuredClone(startState);
    reduce(startState, { type: 'addGauge', amount: 250 });
    expect(startState).toEqual(before);
  });
});
