import { startState } from '@game/data';
import { ageOf } from '@game/time';
import { deepFreeze } from '@test/deepFreeze';
import { addGauge, endPeriod, periodOutlook } from './period';

const capacity = startState.gaugeCapacity;

describe('addGauge', () => {
  it('remplit la jauge sans faire passer de période', () => {
    const next = addGauge(startState, 30);
    expect(next.gauge).toBe(30);
    expect(next.period).toBe(0);
  });

  it('fait passer une période quand la jauge déborde et garde le surplus', () => {
    const next = addGauge({ ...startState, gauge: capacity - 10 }, 25);
    expect(next.period).toBe(1);
    expect(next.gauge).toBe(15);
  });

  it('fait passer plusieurs périodes d’un coup', () => {
    const next = addGauge(startState, capacity * 3 + 10);
    expect(next.period).toBe(3);
    expect(next.gauge).toBe(10);
  });

  it('ignore une quantité nulle ou négative', () => {
    expect(addGauge(startState, 0)).toBe(startState);
    expect(addGauge(startState, -5)).toBe(startState);
  });

  it('refuse une capacité de jauge invalide', () => {
    expect(() => addGauge({ ...startState, gaugeCapacity: 0 }, 1)).toThrow(
      RangeError,
    );
  });

  it('fait vieillir d’un an après 12 périodes', () => {
    const next = addGauge(startState, capacity * 12);
    expect(ageOf(next)).toBe(19);
  });

  it('meurt à l’âge fixé dans les données et s’arrête là', () => {
    const lastPeriod = (75 - 18) * 12 - 1;
    const before = addGauge(startState, capacity * lastPeriod);
    expect(before.status).toBe('playing');

    const dead = addGauge(before, capacity * 5);
    expect(dead.status).toBe('dead');
    expect(ageOf(dead)).toBe(75);
    expect(dead.period).toBe(lastPeriod + 1);
  });

  it('fait payer l’intérêt de la dette en fin de période', () => {
    const next = addGauge({ ...startState, money: -1000 }, capacity);
    // Loyer 300 prélevé : -1 300, puis 5 % d'intérêt.
    expect(next.money).toBe(-1300 - 65);
    expect(next.ledger.history[0]?.figures.interest).toBe(65);
  });

  it('ne change plus rien une fois mort', () => {
    const dead = { ...startState, status: 'dead' as const };
    expect(addGauge(dead, capacity)).toBe(dead);
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(startState));
    expect(() => addGauge(frozen, capacity * 2)).not.toThrow();
    expect(frozen).toEqual(startState);
  });

  it('reste sérialisable', () => {
    const next = addGauge(startState, capacity * 5 + 7);
    // Le but du test est justement l'aller-retour JSON.
    // eslint-disable-next-line unicorn/prefer-structured-clone
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
});

describe('periodOutlook', () => {
  it('compte le loyer à venir dans la balance', () => {
    const rich = { ...startState, money: 1000 };
    expect(periodOutlook(rich).money).toBe(-startState.rent);
  });

  it('prévoit la variation d’argent et de stock de la clôture', () => {
    const state = {
      ...startState,
      money: 500,
      stock: 10,
      companies: { ...startState.companies, atelier: 1, boutique: 1 },
    };
    const outlook = periodOutlook(state);
    const end = endPeriod(state);
    expect(outlook.money).toBe(end.money - state.money);
    expect(outlook.stock).toBe(end.stock - state.ledger.current.stockStart);
  });

  it('reste négative à stock vide quand les ventes dépassent la production', () => {
    const state = {
      ...startState,
      stock: 0,
      companies: { ...startState.companies, boutique: 1 },
    };
    const end = endPeriod(state);
    expect(end.stock).toBe(0);
    expect(periodOutlook(state).stock).toBeLessThan(0);
  });

  it('reste positive à stock plein quand la production dépasse les ventes', () => {
    const state = {
      ...startState,
      stock: startState.stockCapacity,
      companies: { ...startState.companies, atelier: 5 },
    };
    const end = endPeriod(state);
    expect(end.stock).toBe(state.stockCapacity);
    expect(periodOutlook(state).stock).toBeGreaterThan(0);
  });

  it('ajoute ce qui est déjà dépensé dans la période', () => {
    const state = {
      ...startState,
      money: 1000,
      ledger: {
        ...startState.ledger,
        current: { ...startState.ledger.current, purchases: 40 },
      },
    };
    expect(periodOutlook(state).money).toBe(-40 - startState.rent);
  });
});

describe('endPeriod', () => {
  it('avance d’une période et retire une capacité de jauge', () => {
    const next = endPeriod({ ...startState, gauge: capacity + 5 });
    expect(next.period).toBe(1);
    expect(next.gauge).toBe(5);
  });
});
