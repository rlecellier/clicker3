import { economyRules, startState } from '@game/data';
import type { GameState } from '@game/state';
import { endPeriod } from '@game/period';
import { chargeExpenses, produceGoods, sellGoods } from './economy';

const stateWith = (changes: Partial<GameState>): GameState => ({
  ...startState,
  ...changes,
});

describe('produceGoods', () => {
  it('ajoute au stock la production de chaque exemplaire', () => {
    const next = produceGoods(stateWith({ companies: { atelier: 3 } }));
    expect(next.stock).toBe(12);
    expect(next.lastStatement?.stockProduced).toBe(12);
  });

  it('perd la production au-delà de la capacité du stock', () => {
    const next = produceGoods(
      stateWith({ companies: { atelier: 3 }, stock: 45, stockCapacity: 50 }),
    );
    expect(next.stock).toBe(50);
    expect(next.lastStatement?.stockProduced).toBe(5);
    expect(next.lastStatement?.stockLost).toBe(7);
  });

  it('applique le multiplicateur de production', () => {
    const next = produceGoods(
      stateWith({ companies: { atelier: 2 }, productionMultiplier: 1.5 }),
    );
    expect(next.stock).toBe(12);
  });

  it('applique le bonus du travail fait dans l’entreprise', () => {
    const next = produceGoods(
      stateWith({ companies: { atelier: 2 }, workBoosts: { atelier: 2 } }),
    );
    expect(next.stock).toBe(16);
  });
});

describe('sellGoods', () => {
  const shop = { companies: { boutique: 1 } };

  it('écoule le stock contre de l’argent et de la réputation', () => {
    const next = sellGoods(stateWith({ ...shop, stock: 10 }));
    expect(next.stock).toBe(6);
    expect(next.money).toBe(4 * 12);
    expect(next.reputation).toBeCloseTo(4 * economyRules.reputationPerSale);
    expect(next.lastStatement?.revenue).toBe(48);
    expect(next.lastStatement?.stockSold).toBe(4);
  });

  it('vend ce qu’il reste quand le stock est insuffisant et perd de la réputation', () => {
    const next = sellGoods(stateWith({ ...shop, stock: 1, reputation: 5 }));
    expect(next.stock).toBe(0);
    expect(next.money).toBe(12);
    expect(next.reputation).toBeCloseTo(
      5 + economyRules.reputationPerSale - economyRules.stockoutPenalty,
    );
    expect(next.lastStatement?.reputationLost).toBeCloseTo(
      economyRules.stockoutPenalty,
    );
  });

  it('ne fait pas perdre de réputation sans commerce', () => {
    const next = sellGoods(stateWith({ stock: 0, reputation: 5 }));
    expect(next.reputation).toBe(5);
  });

  it('applique le multiplicateur de ventes et remet les bonus à zéro', () => {
    const next = sellGoods(
      stateWith({
        ...shop,
        stock: 10,
        salesMultiplier: 1.25,
        workBoosts: { boutique: 1 },
      }),
    );
    // Capacité 4 × 1,5 = 6 articles, 6 × 12 × 1,25 = 90.
    expect(next.money).toBe(90);
    expect(next.workBoosts).toEqual({});
  });
});

describe('chargeExpenses', () => {
  it('prélève le loyer et les salaires', () => {
    const next = chargeExpenses(stateWith({ money: 1000, payroll: 100 }));
    expect(next.money).toBe(1000 - 300 - 100);
    expect(next.lastStatement?.expenses).toBe(400);
    expect(next.lastStatement?.unpaid).toBe(false);
  });

  it('gère l’impayé : paie ce qu’il peut, perd de la réputation, note l’événement', () => {
    const next = chargeExpenses(stateWith({ money: 100, reputation: 5 }));
    expect(next.money).toBe(0);
    expect(next.reputation).toBe(5 - economyRules.unpaidPenalty);
    expect(next.events).toEqual([{ period: 0, id: 'unpaid' }]);
    expect(next.lastStatement?.unpaid).toBe(true);
    expect(next.lastStatement?.expenses).toBe(100);
  });

  it('ne fait pas descendre la réputation sous 0', () => {
    const next = chargeExpenses(stateWith({ money: 0, reputation: 0.5 }));
    expect(next.reputation).toBe(0);
  });
});

describe('résolution d’une période', () => {
  it('suit l’ordre production, ventes, dépenses', () => {
    const state = stateWith({
      companies: { atelier: 1, boutique: 1 },
      money: 400,
      stock: 0,
    });
    const next = endPeriod({ ...state, gauge: state.gaugeCapacity });
    // 4 articles produits puis vendus 48 € dans la même période, puis loyer 300.
    expect(next.money).toBe(400 + 48 - 300);
    expect(next.stock).toBe(0);
    expect(next.period).toBe(1);
    expect(next.lastStatement).toMatchObject({
      period: 0,
      revenue: 48,
      expenses: 300,
      stockProduced: 4,
      stockSold: 4,
      unpaid: false,
    });
  });

  it('est déterministe', () => {
    const state = stateWith({ companies: { atelier: 2, boutique: 1 } });
    expect(endPeriod(state)).toEqual(endPeriod(state));
  });
});
