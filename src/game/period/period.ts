import {
  chargeExpenses,
  chargeInterest,
  payWages,
  periodProduction,
  periodSalesCapacity,
  produceGoods,
  sellGoods,
} from '@game/economy';
import { triggerEvents } from '@game/events';
import { closePeriod } from '@game/ledger';
import type { GameState } from '@game/state';
import { ageOf } from '@game/time';

/** Étape 4 : le personnage vieillit d'une période, et meurt à l'âge fixé. */
export const ageCharacter = (state: GameState): GameState => {
  const aged = { ...state, period: state.period + 1 };
  return ageOf(aged) >= aged.life.deathAge ? { ...aged, status: 'dead' } : aged;
};

/** Étape 5 : la jauge repart, le surplus de la période est conservé. */
export const resetGauge = (state: GameState): GameState => ({
  ...state,
  gauge: Math.max(0, state.gauge - state.gaugeCapacity),
});

/**
 * Étapes 1 à 3 : production, ventes, salaires gagnés, loyer et salaires
 * versés, intérêts. Seule chaîne de la clôture : la résolution de période et
 * la balance prévue l'appliquent toutes les deux.
 */
const closingSteps = [
  produceGoods,
  sellGoods,
  payWages,
  chargeExpenses,
  chargeInterest,
] as const;

export const settleAccounts = (state: GameState): GameState => {
  let settled = state;
  for (const step of closingSteps) {
    settled = step(settled);
  }
  return settled;
};

export const endPeriod = (state: GameState): GameState => {
  // Le ledger se ferme avant les événements : ceux-ci surviennent au début de
  // la période suivante (ils sont datés d'elle) et s'y écrivent.
  const charged = closePeriod(settleAccounts(state));
  return triggerEvents(resetGauge(ageCharacter(charged)));
};

/**
 * Balance prévue de la période en cours. L'argent : sa variation exacte au
 * passage de période. Ce qui est déjà payé (achats, études) est déjà dans
 * l'argent, donc n'y figure pas ; elle compte ce que la clôture apportera
 * (salaires gagnés, ventes) ou prélèvera (loyer, salaires versés, intérêts) :
 * travailler la fait monter. Le stock : l'écart entre la production et la
 * capacité de vente de la période, sans tenir compte de l'entrepôt (stock
 * vide ou plein). L'état reçu n'est pas modifié.
 */
export const periodOutlook = (state: GameState) => ({
  money: settleAccounts(state).money - state.money,
  stock: periodProduction(state) - periodSalesCapacity(state),
});

/**
 * Ajoute du temps à la jauge. Chaque fois qu'elle est pleine, une période
 * passe ; une grosse quantité peut en faire passer plusieurs. Rien ne se passe
 * une fois le personnage mort.
 */
export const addGauge = (state: GameState, amount: number): GameState => {
  if (state.gaugeCapacity <= 0) {
    throw new RangeError('gaugeCapacity doit être strictement positive');
  }
  if (state.status === 'dead' || amount <= 0) {
    return state;
  }
  let next: GameState = { ...state, gauge: state.gauge + amount };
  while (next.status === 'playing' && next.gauge >= next.gaugeCapacity) {
    next = endPeriod(next);
  }
  return next;
};
