import type { GameState, Ledger, LedgerFigures } from '@game/state';

export const emptyFigures = (): LedgerFigures => ({
  wages: 0,
  sales: 0,
  surplus: 0,
  otherIncome: 0,
  rent: 0,
  payroll: 0,
  purchases: 0,
  studies: 0,
  otherExpenses: 0,
  stockProduced: 0,
  stockSold: 0,
  stockLost: 0,
  reputationGained: 0,
  reputationLost: 0,
  reputationSpent: 0,
});

export const emptyLedger = (): Ledger => ({
  current: emptyFigures(),
  last: emptyFigures(),
  total: emptyFigures(),
});

export type LedgerEntry = Partial<LedgerFigures>;

const add = (figures: LedgerFigures, entry: LedgerEntry): LedgerFigures => {
  const result = { ...figures };
  for (const key of Object.keys(entry) as (keyof LedgerFigures)[]) {
    result[key] += entry[key] ?? 0;
  }
  return result;
};

/**
 * Seul point d'enregistrement : ajoute l'écriture à la période en cours et au
 * cumul. Les autres règles l'appellent, elles ne tiennent pas de comptes.
 */
export const record = (ledger: Ledger, entry: LedgerEntry): Ledger => ({
  ...ledger,
  current: add(ledger.current, entry),
  total: add(ledger.total, entry),
});

// Même chose, directement sur l'état.
export const withRecord = (
  state: GameState,
  entry: LedgerEntry,
): GameState => ({
  ...state,
  ledger: record(state.ledger, entry),
});

// Fin de période : la période en cours devient « la dernière », une nouvelle commence.
export const closePeriod = (state: GameState): GameState => ({
  ...state,
  ledger: {
    ...state.ledger,
    last: state.ledger.current,
    current: emptyFigures(),
  },
});

export type LedgerReport = LedgerFigures & {
  // Recettes : salaires, ventes, vente du surplus, autres.
  revenue: number;
  // Dépenses : loyer, salaires versés, achats, études, autres.
  expenses: number;
  // Recettes moins dépenses.
  net: number;
};

const reportOf = (figures: LedgerFigures): LedgerReport => {
  const revenue =
    figures.wages + figures.sales + figures.surplus + figures.otherIncome;
  const expenses =
    figures.rent +
    figures.payroll +
    figures.purchases +
    figures.studies +
    figures.otherExpenses;
  return { ...figures, revenue, expenses, net: revenue - expenses };
};

/** Recettes, dépenses et flux de la dernière période terminée. */
export const lastPeriodReport = (state: GameState): LedgerReport =>
  reportOf(state.ledger.last);

/** Recettes, dépenses et flux cumulés depuis le départ. */
export const totals = (state: GameState): LedgerReport =>
  reportOf(state.ledger.total);
