import { boosts, findById } from '@game/data';
import { withRecord } from '@game/ledger';
import { isRequirementMet } from '@game/requirements';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

export const boostById = (id: string) => findById(boosts, id);

// Un coup de pouce est actif jusqu'à la période `until` (exclue).
export const isBoostActive = (state: GameState, id: string) =>
  state.activeEffects.some(
    (effect) => effect.eventId === id && effect.until > state.period,
  );

export const canBuyBoost = (state: GameState, id: string) => {
  const boost = boostById(id);
  return (
    isPlaying(state) &&
    boost !== undefined &&
    !isBoostActive(state, id) &&
    state.money >= boost.price &&
    isRequirementMet(state, boost.requirement)
  );
};

// Paie le coup de pouce et pose son effet temporaire. Si l'achat est
// impossible, l'état est rendu inchangé.
export const buyBoost = (state: GameState, id: string): GameState => {
  const boost = boostById(id);
  if (boost === undefined || !canBuyBoost(state, id)) {
    return state;
  }
  return withRecord(
    {
      ...state,
      money: state.money - boost.price,
      activeEffects: [
        ...state.activeEffects.filter((effect) => effect.eventId !== id),
        {
          eventId: id,
          kind: boost.kind,
          value: boost.value,
          until: state.period + boost.duration,
        },
      ],
    },
    { purchases: boost.price, purchasesBy: { [id]: boost.price } },
  );
};
