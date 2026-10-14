import { ledgerHistoryLength, startState } from '@game/data';
import { reduce } from '@game/reducer';
import type { GameAction } from '@game/reducer';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';
import {
  closePeriod,
  emptyFigures,
  emptyLedger,
  currentPeriodReport,
  lastPeriodReport,
  periodReports,
  record,
  totals,
  withRecord,
} from './ledger';

describe('record', () => {
  it('ajoute l’écriture à la période en cours et au cumul, et les cumule', () => {
    let ledger = record(emptyLedger(), { wages: 40, stockSold: 3 });
    expect(ledger.current.wages).toBe(40);
    expect(ledger.total.wages).toBe(40);
    expect(ledger.total.stockSold).toBe(3);
    expect(ledger.history).toEqual([]);

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

  it('n’altère pas son entrée et withRecord écrit dans l’état', () => {
    const frozen = deepFreeze(emptyLedger());
    expect(() => record(frozen, { sales: 1 })).not.toThrow();

    const next = withRecord(startState, { studies: 20 });
    expect(next.ledger.total.studies).toBe(20);
    expect(startState.ledger.total.studies).toBe(0);
  });
});

describe('closePeriod', () => {
  it('verse la période en cours dans l’historique et la remet à zéro', () => {
    const written = withRecord(startState, { wages: 40, rent: 300 });
    const closed = closePeriod(written);
    expect(closed.ledger.history).toHaveLength(1);
    expect(closed.ledger.history[0]?.period).toBe(startState.period);
    expect(closed.ledger.history[0]?.figures.wages).toBe(40);
    expect(closed.ledger.current).toEqual(emptyFigures());
    expect(closed.ledger.total.wages).toBe(40);
  });

  it('garde les périodes terminées, la plus récente en tête', () => {
    let state = closePeriod(withRecord(startState, { wages: 40 }));
    state = closePeriod({
      ...withRecord(state, { wages: 5 }),
      period: state.period + 1,
    });
    expect(state.ledger.history.map((entry) => entry.figures.wages)).toEqual([
      5, 40,
    ]);
    expect(state.ledger.total.wages).toBe(45);
  });

  it('ne garde que ledgerHistoryLength périodes sur plus de fermetures', () => {
    let state: GameState = startState;
    for (let index = 1; index <= ledgerHistoryLength + 2; index++) {
      state = closePeriod({
        ...withRecord(state, { wages: index }),
        period: index,
      });
    }
    expect(state.ledger.history).toHaveLength(ledgerHistoryLength);
    expect(state.ledger.history.map((entry) => entry.period)).toEqual([
      5, 4, 3,
    ]);
    expect(state.ledger.history.map((entry) => entry.figures.wages)).toEqual([
      5, 4, 3,
    ]);
    expect(state.ledger.total.wages).toBe(15);
  });

  it('relève le stock de fin dans la période close et de départ dans la suivante', () => {
    const closed = closePeriod({ ...startState, stock: 12 });
    expect(closed.ledger.history[0]?.figures.stockEnd).toBe(12);
    expect(closed.ledger.current.stockStart).toBe(12);
    expect(closed.ledger.current.stockEnd).toBe(0);
  });

  it('record ne touche pas aux niveaux de stock', () => {
    const closed = closePeriod({ ...startState, stock: 12 });
    const next = record(closed.ledger, { stockProduced: 3 });
    expect(next.current.stockStart).toBe(12);
    expect(next.total.stockStart).toBe(0);
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

  it('lit la période en cours, pas la dernière terminée', () => {
    const later = withRecord(state, { wages: 10 });
    expect(currentPeriodReport(later).wages).toBe(
      currentPeriodReport(state).wages + 10,
    );
    expect(currentPeriodReport(later).wages).not.toBe(
      lastPeriodReport(later).wages,
    );
  });

  it('est vide au départ', () => {
    expect(lastPeriodReport(startState).net).toBe(0);
    expect(totals(startState).revenue).toBe(0);
  });
});

describe('ventilation par source', () => {
  const rich: GameState = {
    ...startState,
    money: 30_000_000,
    stockCapacity: 1_000_000,
    stats: { metier: 0, gestion: 200, intelligence: 200, endurance: 200 },
  };
  const play = (actions: GameAction[]) => {
    let state = rich;
    for (const action of actions) {
      state = reduce(state, action);
    }
    return state.ledger.current;
  };

  it('note l’emploi, l’entreprise, l’entrepôt, l’amélioration et le cursus', () => {
    const current = play([
      { type: 'work', target: 'job' },
      { type: 'buyCompany', id: 'atelier' },
      { type: 'buyWarehouse' },
      { type: 'buyUpgrade', id: 'stage-posture' },
      { type: 'study', courseId: 'metier' },
    ]);
    expect(Object.keys(current.wagesBy)).toEqual([]);
    expect(
      Object.keys(current.purchasesBy).toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['atelier', 'stage-posture', 'warehouse']);
    expect(current.studiesBy).toEqual({ metier: current.studies });
  });

  it('cumule deux achats de la même entreprise', () => {
    const current = play([
      { type: 'buyCompany', id: 'atelier' },
      { type: 'buyCompany', id: 'atelier' },
    ]);
    expect(current.purchasesBy).toEqual({ atelier: current.purchases });
  });
});

const sum = (values: Record<string, number>) =>
  Object.values(values).reduce((a, b) => a + b, 0);

describe('invariants sur une partie jouée', () => {
  const rich: GameState = {
    ...startState,
    money: 30_000_000,
    // Place pour toute la production (la capacité se recalcule des entrepôts).
    warehouses: 40_000,
    stockCapacity: 1_000_050,
    // Métier juste sous le dernier palier : l'étude reste permise au début.
    stats: { metier: 80, gestion: 200, intelligence: 200, endurance: 200 },
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
    { type: 'addGauge', amount: 140, kind: 'work' },
  ];

  const play = (steps: number) => {
    const states = [rich];
    for (let index = 0; index < steps; index++) {
      const previous = states.at(-1);
      // Un anniversaire ou une promotion arrête le jeu : on y répond pour
      // continuer à jouer.
      let action: GameAction | undefined = script[index % script.length];
      if (previous?.pendingBirthday !== null) {
        action = { type: 'answerBirthday' };
      } else if (previous.pendingPromotion !== null) {
        action = { type: 'answerPromotion', isAccepted: true };
      }
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

  it('les ventilations en euros somment exactement au total', () => {
    for (const state of states) {
      const figures = [
        state.ledger.total,
        state.ledger.current,
        ...state.ledger.history.map((entry) => entry.figures),
      ];
      for (const entry of figures) {
        expect(sum(entry.salesBy)).toBe(entry.sales);
        expect(sum(entry.wagesBy)).toBe(entry.wages);
        expect(sum(entry.purchasesBy)).toBe(entry.purchases);
        expect(sum(entry.studiesBy)).toBe(entry.studies);
      }
    }
  });

  it('stock de départ + produit − vendu − perdu = stock de fin', () => {
    for (const state of states) {
      for (const { figures } of state.ledger.history) {
        expect(
          figures.stockStart +
            figures.stockProduced -
            figures.stockSold -
            figures.stockLost,
        ).toBe(figures.stockEnd);
      }
      const { current } = state.ledger;
      expect(
        current.stockStart +
          current.stockProduced -
          current.stockSold -
          current.stockLost,
      ).toBe(state.stock);
    }
  });

  it('l’historique reste borné, récent en tête, avec des numéros qui se suivent', () => {
    const last = states.at(-1);
    const history = last?.ledger.history ?? [];
    expect(history).toHaveLength(ledgerHistoryLength);
    expect(history.map((entry) => entry.period)).toEqual([
      (last?.period ?? 0) - 1,
      (last?.period ?? 0) - 2,
      (last?.period ?? 0) - 3,
    ]);
  });

  it('periodReports donne la période en cours puis l’historique', () => {
    const last = states.at(-1) ?? rich;
    const reports = periodReports(last);
    expect(reports.map((report) => report.period)).toEqual([
      last.period,
      ...last.ledger.history.map((entry) => entry.period),
    ]);
    expect(reports[0]?.sales).toBe(last.ledger.current.sales);
    expect(reports[1]?.net).toBe(lastPeriodReport(last).net);
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
    state = reduce(state, {
      type: 'addGauge',
      amount: rich.gaugeCapacity,
      kind: 'work',
    });
    const first = lastPeriodReport(state);
    expect(first.rent).toBe(startState.rent);
    state = reduce(state, {
      type: 'addGauge',
      amount: rich.gaugeCapacity,
      kind: 'work',
    });
    expect(lastPeriodReport(state).rent).toBe(startState.rent);
    expect(totals(state).rent).toBe(2 * startState.rent);
  });

  it('relève une période : recettes − dépenses = variation d’argent', () => {
    const before: GameState = {
      ...rich,
      companies: { atelier: 2, boutique: 2 },
    };
    const after = reduce(before, {
      type: 'addGauge',
      amount: rich.gaugeCapacity,
      kind: 'work',
    });
    const report = lastPeriodReport(after);
    expect(after.money - before.money).toBe(report.net);
    expect(report.sales).toBeGreaterThan(0);
  });
});
