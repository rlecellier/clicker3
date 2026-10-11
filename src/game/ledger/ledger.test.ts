import { startState } from '@game/data';
import { reduce } from '@game/reducer';
import type { GameAction } from '@game/reducer';
import type { GameState } from '@game/state';
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

  it('cumule le détail du stock par origine et destination', () => {
    let ledger = record(emptyLedger(), { stockIn: { atelier: 4 } });
    ledger = record(ledger, {
      stockIn: { atelier: 2, manufacture: 1 },
      stockOut: { surplus: 3 },
    });
    expect(ledger.current.stockIn).toEqual({ atelier: 6, manufacture: 1 });
    expect(ledger.total.stockOut).toEqual({ surplus: 3 });
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

const sum = (values: Record<string, number>) =>
  Object.values(values).reduce((a, b) => a + b, 0);

describe('invariants sur une partie jouée', () => {
  const rich: GameState = {
    ...startState,
    money: 30_000,
    stats: { metier: 200, gestion: 200, intelligence: 200, endurance: 200 },
    reputation: 50,
    reputationEarned: 50,
    upgrades: ['procedure-travail'],
    autoWork: true,
  };

  const script: GameAction[] = [
    { type: 'buyUpgrade', id: 'stage-posture' },
    { type: 'buyCompany', id: 'atelier' },
    { type: 'buyCompany', id: 'atelier' },
    { type: 'work', target: 'job' },
    { type: 'work', target: 'atelier' },
    { type: 'buyCompany', id: 'boutique' },
    { type: 'study', courseId: 'metier' },
    { type: 'work', target: 'job' },
    { type: 'sellSurplus' },
    { type: 'changeJob', id: 'polyvalent' },
    { type: 'unlockDistrict', id: 'hauts-fourneaux' },
    { type: 'buyUpgrade', id: 'bts-opportunites' },
    { type: 'autoTick', elapsedMs: 6000 },
    { type: 'work', target: 'boutique' },
    { type: 'addGauge', amount: 140 },
  ];

  const play = (steps: number) => {
    const states = [rich];
    for (let index = 0; index < steps; index++) {
      const action = script[index % script.length];
      const previous = states.at(-1);
      if (action !== undefined && previous !== undefined) {
        states.push(reduce(previous, action));
      }
    }
    return states;
  };

  const states = play(1500);

  it('argent final − argent initial = recettes − dépenses cumulées', () => {
    for (const state of states) {
      const cumulated = totals(state);
      expect(state.money - rich.money).toBe(
        cumulated.revenue - cumulated.expenses,
      );
    }
  });

  it('stock = produit − vendu − perdu', () => {
    for (const state of states) {
      const cumulated = totals(state);
      expect(state.stock).toBe(
        cumulated.stockProduced - cumulated.stockSold - cumulated.stockLost,
      );
    }
  });

  it('le détail du stock somme au total, entrées et sorties', () => {
    for (const state of states) {
      const cumulated = state.ledger.total;
      expect(sum(cumulated.stockIn)).toBe(cumulated.stockProduced);
      expect(sum(cumulated.stockOut)).toBe(cumulated.stockSold);
    }
  });

  it('réputation = gagnée − perdue − dépensée', () => {
    for (const state of states) {
      const cumulated = totals(state);
      expect(state.reputation - rich.reputation).toBeCloseTo(
        cumulated.reputationGained -
          cumulated.reputationLost -
          cumulated.reputationSpent,
      );
    }
  });

  it('a vraiment joué des recettes, des dépenses et des périodes', () => {
    const last = states.at(-1);
    expect(last?.period).toBeGreaterThan(100);
    const cumulated = last === undefined ? undefined : totals(last);
    expect(cumulated?.wages).toBeGreaterThan(0);
    expect(cumulated?.sales).toBeGreaterThan(0);
    expect(cumulated?.surplus).toBeGreaterThan(0);
    expect(cumulated?.rent).toBeGreaterThan(0);
    expect(cumulated?.purchases).toBeGreaterThan(0);
    expect(cumulated?.studies).toBeGreaterThan(0);
    expect(cumulated?.otherExpenses).toBeGreaterThan(0);
    expect(cumulated?.reputationSpent).toBeGreaterThan(0);
  });

  it('remet à zéro la « dernière période » à chaque période', () => {
    let state = rich;
    state = reduce(state, { type: 'addGauge', amount: 100 });
    const first = lastPeriodReport(state);
    expect(first.rent).toBe(startState.rent);
    state = reduce(state, { type: 'addGauge', amount: 100 });
    expect(lastPeriodReport(state).rent).toBe(startState.rent);
    expect(totals(state).rent).toBe(2 * startState.rent);
  });

  it('relève une période : recettes − dépenses = variation d’argent', () => {
    const before: GameState = {
      ...rich,
      companies: { atelier: 2, boutique: 2 },
    };
    const after = reduce(before, { type: 'addGauge', amount: 100 });
    const report = lastPeriodReport(after);
    expect(after.money - before.money).toBe(report.net);
    expect(report.sales).toBeGreaterThan(0);
  });
});
