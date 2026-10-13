import { findById, placements } from '@game/data';
import type { Placement } from '@game/data';
import { activeBonus } from '@game/effects';
import { fixedExpensesOf } from '@game/economy';
import { withRecord } from '@game/ledger';
import { isRequirementMet } from '@game/requirements';
import { reputationTierOf } from '@game/reputation';
import { isPlaying, placementIds } from '@game/state';
import type { GameState, PlacementId } from '@game/state';

export const placementById = (id: PlacementId) => findById(placements, id);

export const isPlacementUnlocked = (state: GameState, id: PlacementId) => {
  const placement = placementById(id);
  return (
    placement !== undefined && isRequirementMet(state, placement.requirement)
  );
};

// Plafond de capital placé : monte à chaque palier de réputation, 0 tant que le
// placement n'est pas débloqué.
export const ceilingOf = (state: GameState, id: PlacementId) => {
  const placement = placementById(id);
  if (placement === undefined || !isPlacementUnlocked(state, id)) {
    return 0;
  }
  const step = reputationTierOf(state) - placement.requirement.tier;
  return placement.ceilings[Math.min(step, placement.ceilings.length - 1)] ?? 0;
};

// Rendement de la période : le taux du placement, plus l'écart des événements
// pour le compte titres. Jamais en dessous de -100 %.
export const rateOf = (state: GameState, placement: Placement) =>
  Math.max(
    -1,
    placement.rate +
      (placement.id === 'stocks' ? activeBonus(state, 'stocksRate') : 0),
  );

// Capital placé au total.
export const capitalOf = (state: GameState) =>
  placementIds.reduce((total, id) => total + state.placements[id], 0);

// Euros que `deposit` placerait : limités par l'argent disponible et le plafond.
export const depositable = (state: GameState, id: PlacementId) =>
  Math.max(
    0,
    Math.min(
      Math.floor(state.money),
      ceilingOf(state, id) - state.placements[id],
    ),
  );

// Place de l'argent du compte courant (au plus `amount`, entier).
export const deposit = (
  state: GameState,
  id: PlacementId,
  amount: number,
): GameState => {
  const moved = Math.min(Math.floor(amount), depositable(state, id));
  if (!isPlaying(state) || !(moved > 0)) {
    return state;
  }
  return {
    ...state,
    money: state.money - moved,
    placements: { ...state.placements, [id]: state.placements[id] + moved },
  };
};

// Reprend du capital sur le compte courant : jamais bloqué.
export const withdraw = (
  state: GameState,
  id: PlacementId,
  amount: number,
): GameState => {
  const moved = Math.min(Math.floor(amount), state.placements[id]);
  if (!isPlaying(state) || !(moved > 0)) {
    return state;
  }
  return {
    ...state,
    money: state.money + moved,
    placements: { ...state.placements, [id]: state.placements[id] - moved },
  };
};

// Étape 2 ter : si l'argent ne couvre pas les dépenses fixes, les placements
// sont repris (épargne d'abord) : on peut toujours dépenser son capital.
export const coverExpenses = (state: GameState): GameState => {
  let covered = state;
  for (const id of placementIds) {
    const shortfall = fixedExpensesOf(covered) - covered.money;
    if (shortfall <= 0) {
      break;
    }
    covered = withdraw(covered, id, shortfall);
  }
  return covered;
};

// Rendement qu'apporterait la prochaine période : somme des gains versés sur le
// compte courant (une perte ne se verse pas, elle ronge le capital).
export const expectedYield = (state: GameState) =>
  placements.reduce(
    (total, placement) =>
      total +
      Math.max(
        0,
        Math.round(state.placements[placement.id] * rateOf(state, placement)),
      ),
    0,
  );

// Étape 4 : chaque placement rapporte à la période. Un gain est versé sur le
// compte courant ; une perte (krach) retire du capital placé.
export const payYields = (state: GameState): GameState => {
  let paid = state;
  for (const placement of placements) {
    const capital = paid.placements[placement.id];
    const change = Math.round(capital * rateOf(paid, placement));
    if (change > 0) {
      paid = withRecord(
        { ...paid, money: paid.money + change },
        { yields: change },
      );
    } else if (change < 0) {
      paid = {
        ...paid,
        placements: {
          ...paid.placements,
          [placement.id]: Math.max(0, capital + change),
        },
      };
    }
  }
  return paid;
};
