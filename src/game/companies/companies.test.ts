import { companies, startState } from '@game/data';
import {
  buyCompany,
  canBuyCompany,
  companyCost,
  buyWarehouse,
  canBuyWarehouse,
  fitsWarehouse,
  warehouseCost,
} from './companies';

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
    expect(companyCost('atelier', 0)).toBe(150);
    expect(companyCost('atelier', 1)).toBe(165);
    expect(companyCost('atelier', 2)).toBe(182);
    expect(companyCost('atelier', 5)).toBe(242);
  });
});

describe('buyCompany', () => {
  it('achète un exemplaire et débite le coût', () => {
    const next = buyCompany(ready, 'atelier');
    expect(next.companies).toEqual({ atelier: 1 });
    expect(next.money).toBe(1_000_000 - 150);
  });

  it('achète plusieurs exemplaires à coût croissant', () => {
    const next = buyCompany(buyCompany(ready, 'atelier'), 'atelier');
    expect(next.companies['atelier']).toBe(2);
    expect(next.money).toBe(1_000_000 - 150 - 165);
  });

  it('refuse sans assez d’argent', () => {
    const poor = { ...ready, money: 149 };
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

describe('entrepôt', () => {
  it('refuse une production qui dépasse la capacité du stock', () => {
    const small = { ...ready, stockCapacity: 4 };
    const one = buyCompany(small, 'atelier');
    const two = buyCompany(one, 'atelier');
    expect(two.companies['atelier']).toBe(2);
    expect(fitsWarehouse(two, 'atelier')).toBe(false);
    expect(buyCompany(two, 'atelier')).toBe(two);
  });

  it('autorise à nouveau l’achat une fois l’entrepôt agrandi', () => {
    const full = { ...ready, stockCapacity: 2, companies: { atelier: 1 } };
    expect(canBuyCompany(full, 'atelier')).toBe(false);
    expect(canBuyCompany({ ...full, stockCapacity: 4 }, 'atelier')).toBe(true);
  });

  it('ne bloque plus quand tous les agrandissements sont achetés', () => {
    const maxed = {
      ...ready,
      stockCapacity: 2,
      companies: { atelier: 1 },
      upgrades: ['etageres-kit', 'entrepot-logistique'],
    };
    expect(canBuyCompany(maxed, 'atelier')).toBe(true);
  });

  it('ne limite jamais l’achat d’un commerce', () => {
    const jammed = { ...ready, stockCapacity: 0 };
    expect(canBuyCompany(jammed, 'boutique')).toBe(true);
  });
});

describe('petits entrepôts', () => {
  it('coûtent de plus en plus cher, arrondi', () => {
    expect(warehouseCost(0)).toBe(100);
    expect(warehouseCost(1)).toBe(115);
    expect(warehouseCost(2)).toBe(132);
  });

  it('ajoutent de la capacité et débitent le coût', () => {
    const next = buyWarehouse({ ...startState, money: 500 });
    expect(next.warehouses).toBe(1);
    expect(next.stockCapacity).toBe(startState.stockCapacity + 25);
    expect(next.money).toBe(400);
  });

  it('se débloquent toujours, sans condition de compétence', () => {
    expect(canBuyWarehouse({ ...startState, money: 100 })).toBe(true);
  });

  it('refusent sans assez d’argent ou si le personnage est mort', () => {
    const poor = { ...startState, money: 99 };
    expect(buyWarehouse(poor)).toBe(poor);
    const dead = { ...startState, money: 500, status: 'dead' as const };
    expect(buyWarehouse(dead)).toBe(dead);
  });
});
