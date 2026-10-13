import { ledgerHistoryLength } from '@game/data';
import type { GameState, Ledger, LedgerFigures } from '@game/state';

export const emptyFigures = (): LedgerFigures => ({
  wages: 0,
  sales: 0,
  surplus: 0,
  otherIncome: 0,
  rent: 0,
  living: 0,
  charges: 0,
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
  stockStart: 0,
  stockEnd: 0,
  salesBy: {},
  wagesBy: {},
  purchasesBy: {},
  studiesBy: {},
  reputationGained: 0,
  reputationLost: 0,
  reputationSpent: 0,
});

export const emptyLedger = (): Ledger => ({
  current: emptyFigures(),
  history: [],
  total: emptyFigures(),
});

// Les niveaux de stock (`stockStart`, `stockEnd`) ne s'additionnent pas : ils
// sont posés par `closePeriod`, pas enregistrés.
export type LedgerEntry = Partial<
  Omit<LedgerFigures, 'stockStart' | 'stockEnd'>
>;

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
  living: figures.living + (entry.living ?? 0),
  charges: figures.charges + (entry.charges ?? 0),
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
  salesBy: addRecords(figures.salesBy, entry.salesBy ?? {}),
  wagesBy: addRecords(figures.wagesBy, entry.wagesBy ?? {}),
  purchasesBy: addRecords(figures.purchasesBy, entry.purchasesBy ?? {}),
  studiesBy: addRecords(figures.studiesBy, entry.studiesBy ?? {}),
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

/**
 * Fin de période : la période en cours (avec le stock restant) est versée en
 * tête de l'historique, borné à `ledgerHistoryLength`, et une nouvelle commence
 * avec le stock actuel comme stock de départ. Appelée avant que `period` ne
 * change : la période versée est `state.period`.
 */
export const closePeriod = (state: GameState): GameState => ({
  ...state,
  ledger: {
    ...state.ledger,
    history: [
      {
        period: state.period,
        figures: { ...state.ledger.current, stockEnd: state.stock },
      },
      ...state.ledger.history,
    ].slice(0, ledgerHistoryLength),
    current: { ...emptyFigures(), stockStart: state.stock },
  },
});

export type LedgerReport = LedgerFigures & {
  // Recettes : salaires, ventes, vente du surplus, autres.
  revenue: number;
  // Dépenses : loyer, train de vie, charges des entreprises, salaires versés, achats, études, intérêts, autres.
  expenses: number;
  // Recettes moins dépenses.
  net: number;
};

const reportOf = (figures: LedgerFigures): LedgerReport => {
  const revenue =
    figures.wages + figures.sales + figures.surplus + figures.otherIncome;
  const expenses =
    figures.rent +
    figures.living +
    figures.charges +
    figures.payroll +
    figures.purchases +
    figures.studies +
    figures.otherExpenses +
    figures.interest;
  return { ...figures, revenue, expenses, net: revenue - expenses };
};

/** Une période et son numéro. */
export type PeriodReport = LedgerReport & { period: number };

/** Recettes, dépenses et flux de la dernière période terminée (nuls au départ). */
export const lastPeriodReport = (state: GameState): LedgerReport =>
  reportOf(state.ledger.history[0]?.figures ?? emptyFigures());

/** Recettes, dépenses et flux de la période en cours. */
export const currentPeriodReport = (state: GameState): LedgerReport =>
  reportOf(state.ledger.current);

/**
 * La période en cours, puis les périodes terminées de la plus récente à la
 * plus ancienne (au plus `ledgerHistoryLength`).
 */
export const periodReports = (state: GameState): PeriodReport[] => [
  { ...reportOf(state.ledger.current), period: state.period },
  ...state.ledger.history.map(({ period, figures }) => ({
    ...reportOf(figures),
    period,
  })),
];

/** Recettes, dépenses et flux cumulés depuis le départ. */
export const totals = (state: GameState): LedgerReport =>
  reportOf(state.ledger.total);
