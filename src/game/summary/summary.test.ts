import { companies, startState, upgrades } from '@game/data';
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

const companiesTotal = companies.reduce(
  (total, company) => total + company.maxCopies,
  0,
);

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
      earned: 0,
      companiesTotal,
      upgradesOwned: 0,
      upgradesTotal: upgrades.length,
      housing: 'Studio',
      reputation: 7,
      impact: impactOf(state),
    });
  });

  it('compte le capital placé dans l’argent', () => {
    const state = {
      ...startState,
      money: 1010,
      placements: { savings: 300, ldds: 0, pel: 0, stocks: 700 },
    };
    expect(lifeSummary(state)).toMatchObject({ money: 1010, capital: 1000 });
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
      earned: 0,
      companiesTotal,
      upgradesOwned: 0,
      upgradesTotal: upgrades.length,
      housing: 'Studio',
      reputation: 0,
      impact: impactOf(startState),
    });
    expect(lifeSummary(startState).impact.city).toEqual([
      { id: 'pollution', value: 0 },
      { id: 'inequality', value: 0 },
    ]);
  });

  it('cumule tout l’argent gagné, pas seulement ce qui reste', () => {
    const state = {
      ...startState,
      money: 5,
      ledger: {
        ...startState.ledger,
        total: {
          ...startState.ledger.total,
          wages: 100,
          sales: 2000,
          yields: 30,
        },
      },
    };
    expect(lifeSummary(state)).toMatchObject({ money: 5, earned: 2130 });
  });

  it('compte les améliorations achetées et le logement', () => {
    const state = {
      ...startState,
      upgrades: ['cartes-visite', 'loft-pole'],
      housingId: 'loft-pole',
    };
    expect(lifeSummary(state)).toMatchObject({
      upgradesOwned: 2,
      housing: "Loft au Pôle d'Excellence",
    });
  });
});
