import { economyRules, startState } from '@game/data';
import type { GameState } from '@game/state';
import { endPeriod } from '@game/period';
import {
  chargeExpenses,
  chargeInterest,
  produceGoods,
  sellGoods,
} from './economy';

const stateWith = (changes: Partial<GameState>): GameState => ({
  ...startState,
  ...changes,
});

describe('produceGoods', () => {
  it('ajoute au stock la production de chaque exemplaire', () => {
    const next = produceGoods(stateWith({ companies: { atelier: 3 } }));
    expect(next.stock).toBe(6);
    expect(next.ledger.current.stockProduced).toBe(6);
    expect(next.ledger.current.stockIn).toEqual({ atelier: 6 });
  });

  it('ne perd rien à la production, même au-delà de la capacité', () => {
    const next = produceGoods(
      stateWith({ companies: { atelier: 3 }, stock: 45, stockCapacity: 50 }),
    );
    expect(next.stock).toBe(51);
    expect(next.ledger.current.stockProduced).toBe(6);
    expect(next.ledger.current.stockLost).toBe(0);
    expect(next.ledger.current.stockIn).toEqual({ atelier: 6 });
  });

  it('applique le multiplicateur de production', () => {
    const next = produceGoods(
      stateWith({ companies: { atelier: 2 }, productionMultiplier: 1.5 }),
    );
    expect(next.stock).toBe(6);
  });

  it('applique le multiplicateur propre à un type d’entreprise', () => {
    const next = produceGoods(
      stateWith({
        companies: { atelier: 2 },
        companyMultipliers: { atelier: 1.25 },
      }),
    );
    expect(next.stock).toBe(5);
  });

  it('applique le bonus du travail fait dans l’entreprise', () => {
    const next = produceGoods(
      stateWith({ companies: { atelier: 2 }, workBoosts: { atelier: 2 } }),
    );
    expect(next.stock).toBe(8);
  });
});

describe('sellGoods', () => {
  const shop = { companies: { boutique: 1 } };

  it('range l’excédent invendu et perd seulement ce qui dépasse la capacité', () => {
    const next = sellGoods(
      stateWith({ ...shop, stock: 56, stockCapacity: 50 }),
    );
    expect(next.stock).toBe(50);
    expect(next.ledger.current.stockSold).toBe(3);
    expect(next.ledger.current.stockLost).toBe(3);
  });

  it('vend la production avant de la ranger : pas de perte si tout part', () => {
    const produced = produceGoods(
      stateWith({
        companies: { atelier: 3, boutique: 3 },
        stock: 50,
        stockCapacity: 50,
      }),
    );
    const next = sellGoods(produced);
    expect(next.stock).toBe(50 + 6 - 9);
    expect(next.ledger.current.stockLost).toBe(0);
    expect(next.lastStatement?.stockFull).toBe(false);
  });

  it('signale le stock plein seulement si de la production est perdue', () => {
    const full = { stockCapacity: 50 };
    expect(
      sellGoods(stateWith({ ...full, ...shop, stock: 53 })).lastStatement
        ?.stockFull,
    ).toBe(false);
    expect(
      sellGoods(stateWith({ ...full, companies: {}, stock: 54 })).lastStatement
        ?.stockFull,
    ).toBe(true);
  });

  it('écoule le stock contre de l’argent et de la réputation', () => {
    const next = sellGoods(stateWith({ ...shop, stock: 10 }));
    expect(next.stock).toBe(7);
    expect(next.money).toBe(3 * 12);
    expect(next.reputation).toBeCloseTo(3 * economyRules.reputationPerSale);
    expect(next.ledger.current.sales).toBe(36);
    expect(next.ledger.current.stockSold).toBe(3);
    expect(next.ledger.current.stockOut).toEqual({ boutique: 3 });
    expect(next.lastStatement?.stockout).toBe(false);
  });

  it('vend ce qu’il reste quand le stock est insuffisant et perd de la réputation', () => {
    const next = sellGoods(stateWith({ ...shop, stock: 1, reputation: 5 }));
    expect(next.stock).toBe(0);
    expect(next.money).toBe(12);
    expect(next.reputation).toBeCloseTo(
      5 + economyRules.reputationPerSale - economyRules.stockoutPenalty,
    );
    expect(next.lastStatement?.stockout).toBe(true);
    expect(next.ledger.current.reputationLost).toBeCloseTo(
      economyRules.stockoutPenalty,
    );
  });

  it('applique le multiplicateur de réputation par vente', () => {
    const next = sellGoods(
      stateWith({ ...shop, stock: 10, reputationPerSaleMultiplier: 2 }),
    );
    expect(next.reputation).toBeCloseTo(3 * economyRules.reputationPerSale * 2);
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
    // Capacité 3 × 1,5 = 4,5 soit 5 articles, 5 × 12 × 1,25 = 75.
    expect(next.money).toBe(75);
    expect(next.workBoosts).toEqual({});
  });
});

describe('chargeExpenses', () => {
  it('prélève le loyer et les salaires', () => {
    const next = chargeExpenses(stateWith({ money: 1000, payroll: 100 }));
    expect(next.money).toBe(1000 - 300 - 100);
    expect(next.ledger.current.rent).toBe(300);
    expect(next.ledger.current.payroll).toBe(100);
    expect(next.lastStatement?.paidExpenses).toBe(true);
    expect(next.lastStatement?.unpaid).toBe(false);
  });

  it('prélève tout et laisse l’argent passer en négatif (impayé)', () => {
    const next = chargeExpenses(stateWith({ money: 100, reputation: 5 }));
    expect(next.money).toBe(100 - 300);
    expect(next.reputation).toBe(5 - economyRules.unpaidPenalty);
    expect(next.lastStatement?.unpaid).toBe(true);
    expect(next.ledger.current.rent).toBe(300);
    expect(next.ledger.current.reputationLost).toBe(economyRules.unpaidPenalty);
  });

  it('n’est pas un impayé quand le solde reste à zéro', () => {
    const next = chargeExpenses(stateWith({ money: 300 }));
    expect(next.money).toBe(0);
    expect(next.lastStatement?.unpaid).toBe(false);
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
    // 2 articles produits puis vendus 24 € dans la même période, puis loyer 300.
    expect(next.money).toBe(400 + 24 - 300);
    expect(next.stock).toBe(0);
    expect(next.period).toBe(1);
    expect(next.lastStatement).toMatchObject({ period: 0, unpaid: false });
    expect(next.ledger.last).toMatchObject({
      sales: 24,
      rent: 300,
      stockProduced: 2,
      stockSold: 2,
    });
    expect(next.ledger.current.rent).toBe(0);
  });

  it('est déterministe', () => {
    const state = stateWith({ companies: { atelier: 2, boutique: 1 } });
    expect(endPeriod(state)).toEqual(endPeriod(state));
  });
});

describe('chargeInterest', () => {
  it('fait payer un intérêt sur un solde négatif', () => {
    const next = chargeInterest(stateWith({ money: -1000 }));
    expect(next.money).toBe(-1000 - 1000 * economyRules.debtInterestRate);
    expect(next.ledger.current.interest).toBe(
      1000 * economyRules.debtInterestRate,
    );
  });

  it('arrondit l’intérêt à l’euro supérieur', () => {
    expect(chargeInterest(stateWith({ money: -1 })).money).toBe(-2);
  });

  it('ne touche pas un solde positif ou nul', () => {
    const rich = stateWith({ money: 500 });
    expect(chargeInterest(rich)).toBe(rich);
    const flat = stateWith({ money: 0 });
    expect(chargeInterest(flat)).toBe(flat);
  });
});
