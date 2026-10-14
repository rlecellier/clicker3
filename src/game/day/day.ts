import { actionRules, lifeSlices } from '@game/data';
import type { GameState } from '@game/state';
import { ageOf } from '@game/time';

const { hoursPerPeriod, hours: bounds } = actionRules.sleep;

// Ce dont dépend la journée : l'âge (donc la tranche de vie) et les heures de
// sommeil que les améliorations ajoutent ou retirent.
type DayInput = Pick<
  GameState,
  'period' | 'life' | 'sleepMoreHours' | 'sleepLessHours'
>;

// Sommeil de base à un âge : celui de la dernière tranche de vie commencée.
export const baseSleepHours = (age: number) =>
  lifeSlices.findLast((slice) => slice.fromAge <= age)?.sleepBaseHours ??
  bounds.min;

// Sommeil de la période en cours, en heures : base de l'âge, plus « dormir
// plus », moins « dormir moins », borné.
export const sleepHours = (state: DayInput) => {
  const hours =
    baseSleepHours(ageOf(state)) + state.sleepMoreHours - state.sleepLessHours;
  return Math.max(bounds.min, Math.min(bounds.max, hours));
};

// Temps d'éveil de la période, en minutes : ce que la jauge de temps mesure.
export const awakeMinutes = (state: DayInput) =>
  (hoursPerPeriod - sleepHours(state)) * 60;

// Rendement d'apprentissage du sommeil : « dormir plus » le relève, « dormir
// moins » n'y touche pas (on dort moins sans perdre ce qu'on apprenait).
export const learningFactor = (state: DayInput) => {
  const base = baseSleepHours(ageOf(state));
  return (base + state.sleepMoreHours) / base;
};

// Nombre de fois qu'on peut encore faire une action de `minutes` avant la nuit
// (jamais d'horloge à l'écran : on compte les actions). Celle qui déborde sur
// la nuit compte : son surplus se reporte sur la période suivante.
export const actionsLeft = (
  state: Pick<GameState, 'gauge' | 'gaugeCapacity'>,
  minutes: number,
) => Math.max(0, Math.ceil((state.gaugeCapacity - state.gauge) / minutes));
