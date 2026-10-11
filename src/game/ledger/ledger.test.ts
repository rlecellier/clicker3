import { startState } from '@game/data';
import { deepFreeze } from '@test/deepFreeze';
import {
  closePeriod,
  emptyFigures,
  emptyLedger,
  lastPeriodReport,
  record,
  totals,
  withRecord,
} from './ledger';

describe('record', () => {
  it('ajoute l’écriture à la période en cours et au cumul', () => {
    const ledger = record(emptyLedger(), { wages: 40, stockSold: 3 });
    expect(ledger.current.wages).toBe(40);
    expect(ledger.total.wages).toBe(40);
    expect(ledger.total.stockSold).toBe(3);
    expect(ledger.last).toEqual(emptyFigures());
  });

  it('cumule plusieurs écritures', () => {
    let ledger = emptyLedger();
    ledger = record(ledger, { wages: 40 });
    ledger = record(ledger, { wages: 70, rent: 300 });
    expect(ledger.current.wages).toBe(110);
    expect(ledger.current.rent).toBe(300);
  });

  it('ne modifie pas le livre reçu', () => {
    const frozen = deepFreeze(emptyLedger());
    expect(() => record(frozen, { sales: 1 })).not.toThrow();
  });

  it('withRecord écrit dans l’état', () => {
    const next = withRecord(startState, { studies: 20 });
    expect(next.ledger.total.studies).toBe(20);
    expect(startState.ledger.total.studies).toBe(0);
  });
});

describe('closePeriod', () => {
  it('verse la période en cours dans la dernière et la remet à zéro', () => {
    const written = withRecord(startState, { wages: 40, rent: 300 });
    const closed = closePeriod(written);
    expect(closed.ledger.last.wages).toBe(40);
    expect(closed.ledger.current).toEqual(emptyFigures());
    expect(closed.ledger.total.wages).toBe(40);
  });

  it('remplace la dernière période au lieu de l’additionner', () => {
    let state = closePeriod(withRecord(startState, { wages: 40 }));
    state = closePeriod(withRecord(state, { wages: 5 }));
    expect(state.ledger.last.wages).toBe(5);
    expect(state.ledger.total.wages).toBe(45);
  });
});

describe('sélecteurs', () => {
  const state = closePeriod(
    withRecord(startState, {
      wages: 100,
      sales: 50,
      surplus: 10,
      otherIncome: 5,
      rent: 300,
      payroll: 20,
      purchases: 200,
      studies: 20,
      otherExpenses: 1,
    }),
  );

  it('calcule recettes, dépenses et solde de la dernière période', () => {
    const report = lastPeriodReport(state);
    expect(report.revenue).toBe(165);
    expect(report.expenses).toBe(541);
    expect(report.net).toBe(-376);
    expect(report.wages).toBe(100);
  });

  it('calcule les totaux', () => {
    const later = withRecord(state, { wages: 10 });
    expect(totals(later).revenue).toBe(175);
    expect(lastPeriodReport(later).revenue).toBe(165);
  });

  it('est vide au départ', () => {
    expect(lastPeriodReport(startState).net).toBe(0);
    expect(totals(startState).revenue).toBe(0);
  });
});
