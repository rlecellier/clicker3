import { companies, startState } from '@game/data';
import { buyCompany, canBuyCompany, companyCost } from './companies';

const ready = {
  ...startState,
  money: 1_000_000,
  stats: { ...startState.stats, gestion: 10 },
};

describe('données des entreprises', () => {
  it('compte trois entreprises de production et trois de commerce', () => {
    const kinds = companies.map((company) => company.kind);
    expect(kinds.filter((kind) => kind === 'production')).toHaveLength(3);
    expect(kinds.filter((kind) => kind === 'commerce')).toHaveLength(3);
  });

  it('a une croissance entre 1,07 et 1,15', () => {
    for (const company of companies) {
      expect(company.growth).toBeGreaterThanOrEqual(1.07);
      expect(company.growth).toBeLessThanOrEqual(1.15);
    }
  });
});

describe('companyCost', () => {
  it('suit coûtBase × croissance ^ possédés, arrondi', () => {
    expect(companyCost('atelier', 0)).toBe(200);
    expect(companyCost('atelier', 1)).toBe(220);
    expect(companyCost('atelier', 2)).toBe(242);
    expect(companyCost('atelier', 5)).toBe(322);
  });
});

describe('buyCompany', () => {
  it('achète un exemplaire et débite le coût', () => {
    const next = buyCompany(ready, 'atelier');
    expect(next.companies).toEqual({ atelier: 1 });
    expect(next.money).toBe(1_000_000 - 200);
  });

  it('achète plusieurs exemplaires à coût croissant', () => {
    const next = buyCompany(buyCompany(ready, 'atelier'), 'atelier');
    expect(next.companies['atelier']).toBe(2);
    expect(next.money).toBe(1_000_000 - 200 - 220);
  });

  it('refuse sans assez d’argent', () => {
    const poor = { ...ready, money: 199 };
    expect(buyCompany(poor, 'atelier')).toBe(poor);
  });

  it('refuse si la condition manque', () => {
    const novice = { ...ready, stats: startState.stats };
    expect(canBuyCompany(novice, 'atelier')).toBe(false);
    expect(buyCompany(novice, 'atelier')).toBe(novice);
    expect(canBuyCompany(ready, 'plateforme')).toBe(false);
  });

  it('refuse un type inconnu ou un personnage mort', () => {
    expect(buyCompany(ready, 'nulle-part')).toBe(ready);
    const dead = { ...ready, status: 'dead' as const };
    expect(buyCompany(dead, 'atelier')).toBe(dead);
  });
});
