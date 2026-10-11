import { companies } from '@game/data';
import { withRecord } from '@game/ledger';
import { isUnlocked } from '@game/requirements';
import type { GameState } from '@game/state';

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

export const canBuyCompany = (state: GameState, id: string) => {
  const company = companyById(id);
  return (
    state.status === 'playing' &&
    company !== undefined &&
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
    { purchases: cost },
  );
};
