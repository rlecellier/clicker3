import { companies, economyRules } from '@game/data';
import { activeBonus } from '@game/effects';
import type { Company } from '@game/data';
import { record, withRecord } from '@game/ledger';
import { gainReputation, loseReputation } from '@game/reputation';
import type { GameState, PeriodStatement } from '@game/state';

// Les montants et les flux vivent dans le ledger ; le relevé ne garde que les
// drapeaux de la période que lisent les conditions (`@game/requirements`).
const emptyStatement = (period: number): PeriodStatement => ({
  period,
  paidExpenses: false,
  unpaid: false,
  stockout: false,
  stockFull: false,
});

// Relevé de la période en cours de résolution (créé par l'étape 1).
const statementOf = (state: GameState) =>
  state.lastStatement?.period === state.period
    ? state.lastStatement
    : emptyStatement(state.period);

// Unités d'une entreprise sur la période, avec le bonus du travail fait dedans.
const unitsOf = (state: GameState, company: Company, perCopy: number) =>
  (state.companies[company.id] ?? 0) *
  perCopy *
  (state.companyMultipliers[company.id] ?? 1) *
  (1 + economyRules.workBonus * (state.workBoosts[company.id] ?? 0));

// Étape 1 : les entreprises de production ajoutent au stock, dans la limite
// de la capacité de l'entrepôt ; le reste est perdu.
export const produceGoods = (state: GameState): GameState => {
  let produced = 0;
  for (const company of companies) {
    if (company.kind === 'production') {
      produced += unitsOf(state, company, company.output);
    }
  }
  produced = Math.round(produced * state.productionMultiplier);
  const stored = Math.min(
    produced,
    Math.max(0, state.stockCapacity - state.stock),
  );
  return withRecord(
    {
      ...state,
      stock: state.stock + stored,
      lastStatement: {
        ...emptyStatement(state.period),
        stockFull: produced > stored,
      },
    },
    { stockProduced: stored, stockLost: produced - stored },
  );
};

// Étape 2 : les commerces écoulent le stock contre de l'argent et un peu de
// réputation ; un commerce qui ne peut pas tout servir est en rupture.
export const sellGoods = (state: GameState): GameState => {
  let current = state;
  let stock = state.stock;
  let revenue = 0;
  let sold = 0;
  let isStockout = false;
  for (const company of companies) {
    if (company.kind !== 'commerce') {
      continue;
    }
    const capacity = Math.round(unitsOf(state, company, company.capacity));
    if (capacity === 0) {
      continue;
    }
    const units = Math.min(capacity, stock);
    stock -= units;
    sold += units;
    revenue += units * company.price;
    const gain =
      units *
      economyRules.reputationPerSale *
      state.reputationPerSaleMultiplier;
    current = gainReputation(current, gain);
    isStockout ||= units < capacity;
    current =
      units < capacity
        ? loseReputation(current, economyRules.stockoutPenalty)
        : current;
  }
  const earned = Math.round(
    revenue * (state.salesMultiplier + activeBonus(state, 'sales')),
  );
  const statement = statementOf(state);
  return {
    ...current,
    stock,
    money: current.money + earned,
    ledger: record(current.ledger, { sales: earned, stockSold: sold }),
    workBoosts: {},
    lastStatement: { ...statement, stockout: isStockout },
  };
};

// Étape 3 : loyer et salaires. Impayé : on paie ce qu'on peut, la réputation
// baisse et l'événement `unpaid` est noté.
export const chargeExpenses = (state: GameState): GameState => {
  const due = state.rent + state.payroll;
  const paid = Math.min(state.money, due);
  const statement = statementOf(state);
  const rentPaid = Math.min(paid, state.rent);
  const paidState = withRecord(
    { ...state, money: state.money - paid },
    { rent: rentPaid, payroll: paid - rentPaid },
  );
  if (paid >= due) {
    return {
      ...paidState,
      lastStatement: { ...statement, paidExpenses: paid > 0 },
    };
  }
  const penalised = loseReputation(paidState, economyRules.unpaidPenalty);
  return {
    ...penalised,
    lastStatement: { ...statement, paidExpenses: paid > 0, unpaid: true },
  };
};
