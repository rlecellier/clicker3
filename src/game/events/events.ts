import { events, findById, journalLimit } from '@game/data';
import type { EventEffect, GameEvent } from '@game/data';
import { expireEffects } from '@game/effects';
import { withRecord } from '@game/ledger';
import { isUnlocked } from '@game/requirements';
import { gainReputation, loseReputation } from '@game/reputation';
import type { GameState } from '@game/state';
import { lifeFigures } from '@game/summary';
import { withModifiers } from '@game/upgrades';

export const eventById = (id: string) => findById(events, id);

const renderText = (state: GameState, text: string) => {
  const summary = lifeFigures(state);
  const values: Record<string, string> = {
    companies: String(summary.companies),
    money: String(summary.money),
    age: String(summary.age),
    reputation: String(Math.round(summary.reputation)),
  };
  return text.replaceAll(
    /\{(\w+)\}/g,
    (placeholder, key: string) => values[key] ?? placeholder,
  );
};

// Change l'argent (qui peut devenir négatif) et note la variation réelle au livre.
const setMoney = (state: GameState, money: number): GameState => {
  const delta = money - state.money;
  return withRecord(
    { ...state, money },
    delta >= 0 ? { otherIncome: delta } : { otherExpenses: -delta },
  );
};

const applyEffect = (
  state: GameState,
  effect: EventEffect,
  event: GameEvent,
): GameState => {
  switch (effect.type) {
    case 'reputation': {
      return effect.amount >= 0
        ? gainReputation(state, effect.amount)
        : loseReputation(state, -effect.amount);
    }
    case 'money': {
      return setMoney(state, state.money + effect.amount);
    }
    case 'moneyFactor': {
      // Une dette n'est pas touchée par un facteur sur le capital.
      return state.money > 0
        ? setMoney(state, Math.round(state.money * effect.factor))
        : state;
    }
    case 'oneOffRent': {
      return setMoney(state, state.money - state.rent * effect.months);
    }
    case 'rentFactor': {
      return withModifiers({
        ...state,
        rentFactor: state.rentFactor * effect.factor,
      });
    }
    case 'payrollFactor': {
      return withModifiers({
        ...state,
        payrollFactor: state.payrollFactor * effect.factor,
      });
    }
    case 'jobSalaryFactor': {
      const factors = { ...state.jobSalaryFactors };
      for (const id of effect.jobIds) {
        factors[id] = (factors[id] ?? 1) * effect.factor;
      }
      return { ...state, jobSalaryFactors: factors };
    }
    case 'temporary': {
      // Un effet déjà échu (long rattrapage d'absence) n'a plus lieu d'être.
      return effect.untilPeriod > state.period
        ? {
            ...state,
            activeEffects: [
              ...state.activeEffects,
              {
                eventId: event.id,
                kind: effect.kind,
                value: effect.value,
                until: effect.untilPeriod,
              },
            ],
          }
        : state;
    }
  }
};

// Fait survenir un événement : effets, ligne de journal, suivi d'unicité.
export const fireEvent = (state: GameState, event: GameEvent): GameState => {
  let result = state;
  const effects = event.effects ?? [];
  for (const effect of effects) {
    result = applyEffect(result, effect, event);
  }
  result = {
    ...result,
    mailReceived: result.mailReceived + 1,
    events: [
      ...result.events,
      {
        period: state.period,
        id: event.id,
        text: renderText(state, event.text),
      },
    ].slice(-journalLimit),
    firedEvents: event.unique
      ? [...result.firedEvents, event.id]
      : result.firedEvents,
  };
  return result;
};

const shouldFire = (state: GameState, event: GameEvent) => {
  if (event.trigger === undefined || !isUnlocked(state, event.trigger)) {
    return false;
  }
  return event.unique
    ? !state.firedEvents.includes(event.id)
    : state.events.every(
        (entry) => !(entry.id === event.id && entry.period === state.period),
      );
};

// Évalue tous les événements dans l'ordre des données. À appeler en fin de
// période et après chaque action ; sans effet si rien ne se déclenche.
export const triggerEvents = (state: GameState): GameState => {
  let result = expireEffects(state);
  for (const event of events) {
    if (shouldFire(result, event)) {
      result = fireEvent(result, event);
    }
  }
  return result;
};
