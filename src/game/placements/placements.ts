import { findById, journalLimit, placements } from '@game/data';
import type { Placement } from '@game/data';
import { activeBonus } from '@game/effects';
import { fixedExpensesOf } from '@game/economy';
import { withRecord } from '@game/ledger';
import { isRequirementMet } from '@game/requirements';
import { isPlaying, placementIds } from '@game/state';
import type { GameState, PlacementId } from '@game/state';

export const placementById = (id: PlacementId) => findById(placements, id);

// La réputation permet d'ouvrir le compte (il peut ne pas l'être encore).
export const isPlacementEligible = (state: GameState, id: PlacementId) => {
  const placement = placementById(id);
  return (
    placement !== undefined && isRequirementMet(state, placement.requirement)
  );
};

// Compte ouvert chez le banquier : seul un compte ouvert reçoit du capital.
export const isPlacementOpen = (state: GameState, id: PlacementId) =>
  state.openedPlacements.includes(id) && isPlacementEligible(state, id);

// Comptes que la réputation permet d'ouvrir et qui attendent un rendez-vous.
export const openablePlacements = (state: GameState) =>
  placementIds.filter(
    (id) => isPlacementEligible(state, id) && !isPlacementOpen(state, id),
  );

// Ouvre un compte éligible (rendez-vous terminé) et l'écrit au courrier. Sans
// effet si le compte n'est pas éligible ou déjà ouvert.
export const openPlacement = (state: GameState, id: PlacementId): GameState => {
  const placement = placementById(id);
  if (placement === undefined || !openablePlacements(state).includes(id)) {
    return state;
  }
  return {
    ...state,
    openedPlacements: [...state.openedPlacements, id],
    mailReceived: state.mailReceived + 1,
    events: [
      ...state.events,
      {
        period: state.period,
        id: `placement-open-${id}`,
        text: `Votre ${placement.name} est ouvert. Votre conseiller vous recontactera pour vous proposer autre chose.`,
      },
    ].slice(-journalLimit),
  };
};

// Plafond de capital placé : fixe (`Infinity` pour le compte-titres), 0 tant
// que le compte n'est pas ouvert.
export const ceilingOf = (state: GameState, id: PlacementId) => {
  const placement = placementById(id);
  return placement === undefined || !isPlacementOpen(state, id)
    ? 0
    : placement.ceiling;
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

// Matelas du compte courant : deux périodes de dépenses fixes. Il ne bouge pas,
// seul le surplus est placé.
export const bufferOf = (state: GameState) => 2 * fixedExpensesOf(state);

// Compte courant : ce qui reste du solde une fois le capital placé retiré.
export const checkingOf = (state: GameState) => state.money - capitalOf(state);

// Répartition automatique du solde (`money`, total de tous les comptes) :
// 1. si une dépense a entamé le compte courant au-delà de son contenu, elle
//    reprend d'abord le compte au rendement le plus faible (ordre des
//    placements) ;
// 2. le surplus au-dessus du matelas va dans le premier compte qui a de la
//    place. Les revenus remplissent donc le compte courant avant tout.
export const rebalance = (state: GameState): GameState => {
  if (!isPlaying(state)) {
    return state;
  }
  const total = Math.max(0, Math.floor(state.money));
  const accounts = { ...state.placements };
  let overdrawn = capitalOf(state) - total;
  for (const id of placementIds) {
    const taken = Math.min(Math.max(0, overdrawn), accounts[id]);
    accounts[id] -= taken;
    overdrawn -= taken;
  }
  let surplus =
    total - capitalOf({ ...state, placements: accounts }) - bufferOf(state);
  for (const id of placementIds) {
    const moved = Math.max(
      0,
      Math.min(surplus, ceilingOf(state, id) - accounts[id]),
    );
    accounts[id] += moved;
    surplus -= moved;
  }
  return placementIds.every((id) => accounts[id] === state.placements[id])
    ? state
    : { ...state, placements: accounts };
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

// Rendement par période de la répartition actuelle, une fois le solde réparti
// (mesure du simulateur : le joueur virtuel n'attend pas la clôture).
// Le joueur virtuel ouvre tous les comptes dès qu'ils sont possibles.
export const maxYield = (state: GameState) => {
  const opened = [...state.openedPlacements, ...openablePlacements(state)];
  return expectedYield(rebalance({ ...state, openedPlacements: opened }));
};

// Étape 4 : chaque placement rapporte à la période. Un gain est versé sur le
// compte courant ; une perte (krach) retire du capital placé, donc du solde.
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
      const lost = Math.min(-change, capital);
      paid = withRecord(
        {
          ...paid,
          money: paid.money - lost,
          placements: { ...paid.placements, [placement.id]: capital - lost },
        },
        { otherExpenses: lost },
      );
    }
  }
  return paid;
};
