import type { GameState } from '@game/state';
import { ageOf } from '@game/time';

/*
 * Points d'extension de la résolution d'une période (docs/game/v1.md § 1).
 * Chaque étape est l'identité tant que l'issue qui la concerne n'est pas faite.
 */

/** Étape 1 : les entreprises de production ajoutent au stock. */
export const produceGoods = (state: GameState): GameState => state;

/** Étape 2 : les commerces consomment du stock et rapportent de l'argent. */
export const sellGoods = (state: GameState): GameState => state;

/** Étape 3 : loyer et salaires. */
export const chargeExpenses = (state: GameState): GameState => state;

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

export const endPeriod = (state: GameState): GameState => {
  const produced = produceGoods(state);
  const sold = sellGoods(produced);
  const charged = chargeExpenses(sold);
  return resetGauge(ageCharacter(charged));
};

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
