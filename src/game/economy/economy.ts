import { companies, economyRules } from '@game/data';
import type { Company } from '@game/data';
import { gainReputation, loseReputation } from '@game/reputation';
import type { GameState, PeriodStatement } from '@game/state';

const emptyStatement = (period: number): PeriodStatement => ({
  period,
  revenue: 0,
  expenses: 0,
  stockProduced: 0,
  stockSold: 0,
  stockLost: 0,
  reputationGained: 0,
  reputationLost: 0,
  unpaid: false,
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
  return {
    ...state,
    stock: state.stock + stored,
    lastStatement: {
      ...emptyStatement(state.period),
      stockProduced: stored,
      stockLost: produced - stored,
    },
  };
};

// Étape 2 : les commerces écoulent le stock contre de l'argent et un peu de
// réputation ; un commerce qui ne peut pas tout servir est en rupture.
export const sellGoods = (state: GameState): GameState => {
  let current = state;
  let stock = state.stock;
  let revenue = 0;
  let sold = 0;
  let gained = 0;
  let lost = 0;
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
    gained += Math.max(gain, 0);
    const before = current.reputation;
    current =
      units < capacity
        ? loseReputation(current, economyRules.stockoutPenalty)
        : current;
    lost += before - current.reputation;
  }
  const earned = Math.round(revenue * state.salesMultiplier);
  const statement = statementOf(state);
  return {
    ...current,
    stock,
    money: current.money + earned,
    workBoosts: {},
    lastStatement: {
      ...statement,
      revenue: earned,
      stockSold: sold,
      reputationGained: gained,
      reputationLost: lost,
    },
  };
};

// Étape 3 : loyer et salaires. Impayé : on paie ce qu'on peut, la réputation
// baisse et l'événement `unpaid` est noté.
export const chargeExpenses = (state: GameState): GameState => {
  const due = state.rent + state.payroll;
  const paid = Math.min(state.money, due);
  const statement = statementOf(state);
  const paidState = { ...state, money: state.money - paid };
  if (paid >= due) {
    return {
      ...paidState,
      lastStatement: { ...statement, expenses: paid },
    };
  }
  const penalised = loseReputation(paidState, economyRules.unpaidPenalty);
  return {
    ...penalised,
    events: [...state.events, { period: state.period, id: 'unpaid' }],
    lastStatement: {
      ...statement,
      expenses: paid,
      unpaid: true,
      reputationLost:
        statement.reputationLost + (state.reputation - penalised.reputation),
    },
  };
};
