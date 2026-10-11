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
  interest: 0,
  stockProduced: 0,
  stockSold: 0,
  stockLost: 0,
  stockIn: {},
  stockOut: {},
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

const addRecords = (
  base: Record<string, number>,
  entry: Record<string, number>,
) => {
  const result = { ...base };
  for (const [id, amount] of Object.entries(entry)) {
    result[id] = (result[id] ?? 0) + amount;
  }
  return result;
};

const add = (figures: LedgerFigures, entry: LedgerEntry): LedgerFigures => ({
  ...figures,
  wages: figures.wages + (entry.wages ?? 0),
  sales: figures.sales + (entry.sales ?? 0),
  surplus: figures.surplus + (entry.surplus ?? 0),
  otherIncome: figures.otherIncome + (entry.otherIncome ?? 0),
  rent: figures.rent + (entry.rent ?? 0),
  payroll: figures.payroll + (entry.payroll ?? 0),
  purchases: figures.purchases + (entry.purchases ?? 0),
  studies: figures.studies + (entry.studies ?? 0),
  otherExpenses: figures.otherExpenses + (entry.otherExpenses ?? 0),
  interest: figures.interest + (entry.interest ?? 0),
  stockProduced: figures.stockProduced + (entry.stockProduced ?? 0),
  stockSold: figures.stockSold + (entry.stockSold ?? 0),
  stockLost: figures.stockLost + (entry.stockLost ?? 0),
  stockIn: addRecords(figures.stockIn, entry.stockIn ?? {}),
  stockOut: addRecords(figures.stockOut, entry.stockOut ?? {}),
  reputationGained: figures.reputationGained + (entry.reputationGained ?? 0),
  reputationLost: figures.reputationLost + (entry.reputationLost ?? 0),
  reputationSpent: figures.reputationSpent + (entry.reputationSpent ?? 0),
});

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
  // Dépenses : loyer, salaires versés, achats, études, intérêts, autres.
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
    figures.otherExpenses +
    figures.interest;
  return { ...figures, revenue, expenses, net: revenue - expenses };
};

/** Recettes, dépenses et flux de la dernière période terminée. */
export const lastPeriodReport = (state: GameState): LedgerReport =>
  reportOf(state.ledger.last);

/** Recettes, dépenses et flux cumulés depuis le départ. */
export const totals = (state: GameState): LedgerReport =>
  reportOf(state.ledger.total);
