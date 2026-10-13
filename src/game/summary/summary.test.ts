import { startState } from '@game/data';
import { impactOf } from '@game/impact';
import { lifeFigures, lifeSummary } from './summary';

describe('lifeFigures', () => {
  it('donne les chiffres simples, sans les indicateurs d’impact', () => {
    const state = { ...startState, money: 12, companies: { atelier: 2 } };
    expect(lifeFigures(state)).toEqual({
      age: 18,
      companies: 2,
      money: 12,
      reputation: 0,
    });
  });
});

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
      capital: 0,
      reputation: 7,
      impact: impactOf(state),
    });
  });

  it('compte le capital placé à part de l’argent', () => {
    const state = {
      ...startState,
      money: 10,
      placements: { savings: 300, stocks: 700 },
    };
    expect(lifeSummary(state)).toMatchObject({ money: 10, capital: 1000 });
  });

  it('reprend les indicateurs d’impact dans le bilan', () => {
    const state = { ...startState, companies: { atelier: 5 } };
    const { impact } = lifeSummary(state);
    expect(
      impact.city.find((entry) => entry.id === 'pollution')?.value,
    ).toBeGreaterThan(0);
  });

  it('est vide au départ', () => {
    expect(lifeSummary(startState)).toEqual({
      age: 18,
      companies: 0,
      money: 0,
      capital: 0,
      reputation: 0,
      impact: impactOf(startState),
    });
    expect(lifeSummary(startState).impact.city).toEqual([
      { id: 'pollution', value: 0 },
      { id: 'inequality', value: 0 },
    ]);
  });
});
