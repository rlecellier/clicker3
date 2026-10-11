import { startState } from '@game/data';
import { lifeSummary } from './summary';

describe('lifeSummary', () => {
  it('compte les entreprises possédées, l’argent, l’âge et la réputation', () => {
    const state = {
      ...startState,
      period: 12 * 57,
      money: 4200,
      reputation: 7,
      companies: { atelier: 2, boutique: 1 },
    };
    expect(lifeSummary(state)).toEqual({
      age: 75,
      companies: 3,
      money: 4200,
      reputation: 7,
    });
  });

  it('est vide au départ', () => {
    expect(lifeSummary(startState)).toEqual({
      age: 18,
      companies: 0,
      money: 0,
      reputation: 0,
    });
  });
});
