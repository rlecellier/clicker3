import { events, journalLimit } from '@game/data';
import type { EventEffect, GameEvent } from '@game/data';
import { expireEffects } from '@game/effects';
import { isUnlocked } from '@game/requirements';
import { gainReputation, loseReputation } from '@game/reputation';
import type { GameState } from '@game/state';
import { lifeSummary } from '@game/summary';

export const eventById = (id: string) =>
  events.find((candidate) => candidate.id === id);

const renderText = (state: GameState, text: string) => {
  const summary = lifeSummary(state);
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

const applyEffect = (state: GameState, effect: EventEffect): GameState => {
  switch (effect.type) {
    case 'reputation': {
      return effect.amount >= 0
        ? gainReputation(state, effect.amount)
        : loseReputation(state, -effect.amount);
    }
    case 'money': {
      return { ...state, money: Math.max(0, state.money + effect.amount) };
    }
    case 'moneyFactor': {
      return { ...state, money: Math.round(state.money * effect.factor) };
    }
    case 'oneOffRent': {
      return {
        ...state,
        money: Math.max(0, state.money - state.rent * effect.months),
      };
    }
    case 'rentFactor': {
      return { ...state, rent: Math.round(state.rent * effect.factor) };
    }
    case 'payrollFactor': {
      return { ...state, payroll: Math.round(state.payroll * effect.factor) };
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
                eventId: '',
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
    result = applyEffect(result, effect);
  }
  result = {
    ...result,
    activeEffects: result.activeEffects.map((effect) =>
      effect.eventId === '' ? { ...effect, eventId: event.id } : effect,
    ),
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
