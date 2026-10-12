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

// Unités d'une entreprise sur la période, avec le bonus du travail fait dedans
// (avant le multiplicateur de production générale).
const unitsOf = (
  state: GameState,
  company: Company,
  perCopy: number,
  copies = state.companies[company.id] ?? 0,
) =>
  copies *
  perCopy *
  (state.companyMultipliers[company.id] ?? 1) *
  (1 + economyRules.workBonus * (state.workBoosts[company.id] ?? 0));

// Part de chaque entreprise de production dans la production de la période,
// en entiers. C'est la formule unique du moteur et de l'affichage. Arrondi
// cumulé : la somme des parts vaut exactement la production totale arrondie.
export const productionShares = (state: GameState) => {
  const shares: Record<string, number> = {};
  let cumulated = 0;
  let produced = 0;
  for (const company of companies) {
    if (company.kind !== 'production') {
      continue;
    }
    cumulated += unitsOf(state, company, company.output);
    const share = Math.round(cumulated * state.productionMultiplier) - produced;
    produced += share;
    shares[company.id] = share;
  }
  return shares;
};

// Articles produits par période, avant la limite de l'entrepôt.
export const periodProduction = (state: GameState) =>
  Object.values(productionShares(state)).reduce(
    (total, share) => total + share,
    0,
  );

// Valeur finale, par exemplaire, de ce que fait une entreprise (articles
// produits ou vendables par période), tous modificateurs appliqués. Non
// arrondie : c'est l'affichage qui décide de ses décimales.
export const outputPerCopy = (state: GameState, company: Company) =>
  company.kind === 'production'
    ? unitsOf(state, company, company.output, 1) * state.productionMultiplier
    : unitsOf(state, company, company.capacity, 1);

// Facteur appliqué au prix de chaque article vendu : multiplicateur des
// améliorations et bonus temporaires des événements.
export const salesFactor = (state: GameState) =>
  state.salesMultiplier + activeBonus(state, 'sales');

// Prix de vente final d'un article d'un commerce (bonus de vente compris).
export const finalPrice = (state: GameState, company: Company) =>
  company.kind === 'commerce' ? company.price * salesFactor(state) : 0;

// Capacité de vente entière d'un commerce par période, telle que vendue.
export const salesCapacity = (state: GameState, company: Company) =>
  company.kind === 'commerce'
    ? Math.round(unitsOf(state, company, company.capacity))
    : 0;

// Articles que tous les commerces peuvent vendre sur la période.
export const periodSalesCapacity = (state: GameState) =>
  companies.reduce(
    (total, company) => total + salesCapacity(state, company),
    0,
  );

// Étape 1 : les entreprises de production ajoutent leur production au stock,
// sans limite : rien n'est perdu ici. La capacité de l'entrepôt s'applique à
// l'étape 2, une fois les ventes faites.
export const produceGoods = (state: GameState): GameState => {
  const stockIn: Record<string, number> = {};
  let produced = 0;
  const shares = Object.entries(productionShares(state));
  for (const [id, share] of shares) {
    produced += share;
    if (share > 0) {
      stockIn[id] = share;
    }
  }
  return withRecord(
    {
      ...state,
      stock: state.stock + produced,
      lastStatement: {
        ...emptyStatement(state.period),
      },
    },
    { stockProduced: produced, stockIn },
  );
};

// Étape 2 : les commerces écoulent d'abord tout le stock, production de la
// période comprise, contre de l'argent et un peu de réputation ; un commerce
// qui ne peut pas tout servir est en rupture. L'excédent est ensuite rangé
// dans l'entrepôt ; seul ce qui dépasse sa capacité est perdu.
export const sellGoods = (state: GameState): GameState => {
  let current = state;
  let stock = state.stock;
  let revenue = 0;
  let sold = 0;
  const stockOut: Record<string, number> = {};
  // Recette cumulée après chaque commerce : sert à répartir `sales`.
  const cumulatedRevenues: [string, number][] = [];
  let isStockout = false;
  for (const company of companies) {
    if (company.kind !== 'commerce') {
      continue;
    }
    const capacity = salesCapacity(state, company);
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
    cumulatedRevenues.push([company.id, revenue]);
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
  const factor = salesFactor(state);
  const earned = Math.round(revenue * factor);
  // Arrondi cumulé, comme `produceGoods` : la somme des parts vaut `earned`.
  const salesBy: Record<string, number> = {};
  let allocated = 0;
  for (const [id, cumulated] of cumulatedRevenues) {
    const share = Math.round(cumulated * factor) - allocated;
    allocated += share;
    if (share !== 0) {
      salesBy[id] = share;
    }
  }
  const statement = statementOf(state);
  const lost = Math.max(0, stock - state.stockCapacity);
  return {
    ...current,
    stock: stock - lost,
    money: current.money + earned,
    ledger: record(current.ledger, {
      sales: earned,
      salesBy,
      stockSold: sold,
      stockLost: lost,
      stockOut,
    }),
    workBoosts: {},
    lastStatement: {
      ...statement,
      stockout: isStockout,
      // Plein = de la production perdue faute de place, après les ventes.
      stockFull: lost > 0,
    },
  };
};

// Salaires gagnés pendant la période et pas encore versés.
export const wagesDueOf = (state: GameState) =>
  Object.values(state.wagesDue).reduce((sum, amount) => sum + amount, 0);

// Étape 2 bis : les salaires gagnés pendant la période sont versés avant les
// dépenses, pour que le loyer puisse être couvert par le travail.
export const payWages = (state: GameState): GameState => {
  const wagesBy = Object.fromEntries(
    Object.entries(state.wagesDue).filter(([, amount]) => amount !== 0),
  );
  const wages = wagesDueOf({ ...state, wagesDue: wagesBy });
  return {
    ...withRecord({ ...state, money: state.money + wages }, { wages, wagesBy }),
    wagesDue: {},
  };
};

// Train de vie de la période : courses, transport, téléphone. Il monte avec le
// logement (`economyRules.livingCosts`).
export const livingCostOf = (state: GameState) =>
  economyRules.livingCosts[state.housingId] ?? economyRules.baseLivingCost;

// Dépenses fixes prélevées à chaque clôture : loyer, train de vie et salaires.
export const fixedExpensesOf = (state: GameState) =>
  state.rent + livingCostOf(state) + state.payroll;

// Étape 3 : loyer, train de vie et salaires, toujours prélevés en entier : l'argent peut
// devenir négatif (dette). Un solde négatif après les dépenses est un impayé :
// la réputation baisse et l'événement `unpaid` est noté.
export const chargeExpenses = (state: GameState): GameState => {
  const living = livingCostOf(state);
  const due = fixedExpensesOf(state);
  const statement = statementOf(state);
  const paidState = withRecord(
    { ...state, money: state.money - due },
    { rent: state.rent, living, payroll: state.payroll },
  );
  if (paidState.money >= 0) {
    return {
      ...paidState,
      lastStatement: { ...statement, paidExpenses: due > 0 },
    };
  }
  const penalised = loseReputation(paidState, economyRules.unpaidPenalty);
  return {
    ...penalised,
    lastStatement: { ...statement, paidExpenses: due > 0, unpaid: true },
  };
};

// Étape 3 bis : un solde négatif porte intérêt, la dette s'alourdit.
export const chargeInterest = (state: GameState): GameState => {
  if (state.money >= 0) {
    return state;
  }
  const interest = Math.ceil(-state.money * economyRules.debtInterestRate);
  return withRecord({ ...state, money: state.money - interest }, { interest });
};
