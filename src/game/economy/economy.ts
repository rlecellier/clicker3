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
// de la capacité de l'entrepôt ; le reste est perdu. Le drapeau `stockFull`
// est posé à l'étape 2, une fois le stock écoulé.
export const produceGoods = (state: GameState): GameState => {
  // Arrondi cumulé : la somme des parts vaut exactement la production totale.
  const made: Record<string, number> = {};
  let cumulated = 0;
  let produced = 0;
  for (const company of companies) {
    if (company.kind !== 'production') {
      continue;
    }
    cumulated += unitsOf(state, company, company.output);
    const share = Math.round(cumulated * state.productionMultiplier) - produced;
    produced += share;
    made[company.id] = share;
  }
  const stored = Math.min(
    produced,
    Math.max(0, state.stockCapacity - state.stock),
  );
  // Entrepôt plein : les premières entreprises remplissent la place restante.
  let room = stored;
  const stockIn: Record<string, number> = {};
  for (const [id, share] of Object.entries(made)) {
    const kept = Math.min(share, room);
    room -= kept;
    if (kept === 0) {
      continue;
    }
    stockIn[id] = kept;
  }
  return withRecord(
    {
      ...state,
      stock: state.stock + stored,
      lastStatement: {
        ...emptyStatement(state.period),
      },
    },
    { stockProduced: stored, stockLost: produced - stored, stockIn },
  );
};

// Étape 2 : les commerces écoulent le stock contre de l'argent et un peu de
// réputation ; un commerce qui ne peut pas tout servir est en rupture.
export const sellGoods = (state: GameState): GameState => {
  let current = state;
  let stock = state.stock;
  let revenue = 0;
  let sold = 0;
  const stockOut: Record<string, number> = {};
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
    if (units > 0) {
      stockOut[company.id] = units;
    }
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
    ledger: record(current.ledger, {
      sales: earned,
      stockSold: sold,
      stockOut,
    }),
    workBoosts: {},
    lastStatement: {
      ...statement,
      stockout: isStockout,
      // Plein = de la production perdue ET un entrepôt encore plein après les
      // ventes ; sinon le joueur lirait « plein » devant un 0 / capacité.
      stockFull:
        (state.ledger.current.stockLost ?? 0) > 0 &&
        stock >= state.stockCapacity,
    },
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
