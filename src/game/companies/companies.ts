import { companies, economyRules, upgrades } from '@game/data';
import { periodProduction } from '@game/economy';
import { withRecord } from '@game/ledger';
import { isUnlocked } from '@game/requirements';
import type { GameState } from '@game/state';
import { isOwned } from '@game/upgrades';

export const companyById = (id: string) =>
  companies.find((candidate) => candidate.id === id);

// Coût du prochain exemplaire, arrondi une seule fois (ADR 0002).
export const companyCost = (id: string, owned: number) => {
  const company = companyById(id);
  return company === undefined
    ? Infinity
    : Math.round(company.baseCost * company.growth ** owned);
};

export const ownedCount = (state: GameState, id: string) =>
  state.companies[id] ?? 0;

// Une entreprise de production de plus ne doit pas produire plus que
// l'entrepôt ne peut contenir : le surplus serait jeté et les commerces
// ne pourraient pas l'écouler. Un commerce n'est jamais concerné, et la garde
// tombe quand plus aucun agrandissement n'est à acheter : elle ne bloque jamais
// la partie, au pire on jette du stock.
export const fitsWarehouse = (state: GameState, id: string) => {
  const company = companyById(id);
  const canGrow = upgrades.some(
    (upgrade) =>
      !isOwned(state, upgrade.id) &&
      upgrade.effects.some((effect) => effect.type === 'stockCapacity'),
  );
  return (
    company?.kind !== 'production' ||
    !canGrow ||
    periodProduction({
      ...state,
      companies: { ...state.companies, [id]: ownedCount(state, id) + 1 },
    }) <= state.stockCapacity
  );
};

export const canBuyCompany = (state: GameState, id: string) => {
  const company = companyById(id);
  return (
    state.status === 'playing' &&
    company !== undefined &&
    fitsWarehouse(state, id) &&
    state.money >= companyCost(id, ownedCount(state, id)) &&
    (company.requirement === undefined ||
      isUnlocked(state, company.requirement))
  );
};

// Si l'achat est impossible, l'état est rendu inchangé.
export const buyCompany = (state: GameState, id: string): GameState => {
  if (!canBuyCompany(state, id)) {
    return state;
  }
  const owned = ownedCount(state, id);
  const cost = companyCost(id, owned);
  return withRecord(
    {
      ...state,
      money: state.money - cost,
      companies: { ...state.companies, [id]: owned + 1 },
    },
    { purchases: cost, purchasesBy: { [id]: cost } },
  );
};

// Coût du prochain petit entrepôt, arrondi une seule fois (ADR 0002).
export const warehouseCost = (owned: number) =>
  Math.round(
    economyRules.warehouse.baseCost * economyRules.warehouse.growth ** owned,
  );

export const canBuyWarehouse = (state: GameState) =>
  state.status === 'playing' && state.money >= warehouseCost(state.warehouses);

// Ajoute de la capacité de stock ; sans condition, pour toujours pouvoir
// s'en sortir d'un entrepôt trop petit.
export const buyWarehouse = (state: GameState): GameState => {
  if (!canBuyWarehouse(state)) {
    return state;
  }
  const cost = warehouseCost(state.warehouses);
  return withRecord(
    {
      ...state,
      money: state.money - cost,
      warehouses: state.warehouses + 1,
      stockCapacity: state.stockCapacity + economyRules.warehouse.capacity,
    },
    { purchases: cost, purchasesBy: { warehouse: cost } },
  );
};
