import { actionRules, automationRules } from '@game/data';
import { activeBonus } from '@game/effects';
import { addGauge } from '@game/period';
import { isPlaying } from '@game/state';
import type { GameState, QueuedAction } from '@game/state';
import { study } from '@game/study';
import { work } from '@game/work';

// Nombre maximum de gestes gardés pendant un sommeil.
const MAX_QUEUED = 50;

// Délai entre deux pas : un sommeil complet dure toujours `sleepDurationMs`,
// quelle que soit sa durée en heures.
export const sleepStepMs = (state: GameState) =>
  automationRules.sleepDurationMs / Math.max(1, state.sleepTotal);

const { schedule, hours: hourBounds, hoursPerPeriod } = actionRules.sleep;
type SleepHours = keyof typeof schedule;

const sleepHourOptions: ReadonlySet<number> = new Set(
  Object.keys(schedule).map(Number),
);

const isSleepHours = (hours: number): hours is SleepHours =>
  sleepHourOptions.has(hours);

// Horaire d'une durée (heures de l'horloge, marqueurs vidés). Une durée hors
// table (état mal formé) vaut la durée par défaut, pour tout ce qui en dépend.
const scheduleOf = (hours: number) =>
  schedule[isSleepHours(hours) ? hours : hourBounds.default];

// Durée en vigueur pour la période en cours.
const periodHours = (state: GameState) =>
  isSleepHours(state.periodSleepHours)
    ? state.periodSleepHours
    : hourBounds.default;

// Horaire du sommeil de la période en cours.
export const sleepSchedule = (state: GameState) =>
  scheduleOf(state.periodSleepHours);

// Horaire de la durée choisie, pour l'annoncer dans le profil.
export const chosenSchedule = (state: GameState) =>
  scheduleOf(state.sleepHours);

// Coût en jauge de temps d'un sommeil : ses heures sur les 24 de la période.
export const sleepGauge = (
  state: GameState,
  hours: number = periodHours(state),
) => (hours * state.gaugeCapacity) / hoursPerPeriod;

// Niveau de jauge où l'on se couche : les heures écoulées depuis le réveil de
// la période, rapportées aux 24 h de la jauge.
export const bedtimeGauge = (state: GameState) => {
  const sinceWake =
    (sleepSchedule(state).bed -
      actionRules.sleep.dayStartHour +
      hoursPerPeriod) %
    hoursPerPeriod;
  return (sinceWake * state.gaugeCapacity) / hoursPerPeriod;
};

// Nombre de marqueurs que le sommeil peut vider, donc de pas.
export const sleepMarkers = (
  state: GameState,
  hours: number = periodHours(state),
) => scheduleOf(hours).markers;

// Choisit la durée du sommeil quotidien (heures entières de la table). Elle
// sert à partir de la période suivante : le sommeil de celle-ci ne change pas.
export const setSleepHours = (state: GameState, hours: number): GameState =>
  isPlaying(state) && isSleepHours(hours) && hours !== state.sleepHours
    ? { ...state, sleepHours: hours }
    : state;

// Pendant le sommeil, un geste manuel est gardé pour le réveil. Les gestes
// automatiques ne passent pas par là : ils attendent.
export const queueAction = (
  state: GameState,
  action: QueuedAction,
): GameState =>
  !isPlaying(state) || state.queuedActions.length >= MAX_QUEUED
    ? state
    : { ...state, queuedActions: [...state.queuedActions, action] };

// À l'heure du coucher (voir `sleepSchedule`) : la jauge y est arrivée et on
// n'a pas encore dormi cette période, le personnage s'endort (et plus rien
// d'autre ne se fait tant qu'il dort). Une période entière sans sommeil (une
// action a traversé le coucher et la fin de période d'un coup) se rattrape :
// on s'endort dès le réveil. Rend l'état inchangé sinon.
export const fallAsleep = (state: GameState): GameState => {
  if (!isPlaying(state) || state.isSleeping) {
    return state;
  }
  const isOverdue = state.lastSleepPeriod < state.period - 1;
  const isBedtime =
    state.lastSleepPeriod < state.period && state.gauge >= bedtimeGauge(state);
  if (!isOverdue && !isBedtime) {
    return state;
  }
  const markers = sleepMarkers(state);
  // Au moins un pas : dormir prend du temps, même sans rien vider.
  const steps = Math.max(1, markers);
  return {
    ...state,
    isSleeping: true,
    lastSleepPeriod: state.period,
    sleepLeft: steps,
    sleepTotal: steps,
    sleepConvertible: markers,
    sleepStepGauge: sleepGauge(state) / steps,
  };
};

// Un pas de sommeil : le plus ancien marqueur, s'il y en a un, est converti en
// points de stat selon le logement, et le temps passe. Le dernier pas réveille.
// Le sommeil complet coûte `sleepGauge` de jauge de temps, répartie en pas.
export const sleepStep = (state: GameState): GameState => {
  if (!state.isSleeping || !isPlaying(state)) {
    return state;
  }
  if (state.sleepLeft <= 0) {
    return { ...state, isSleeping: false };
  }
  const [marker, ...rest] = state.markers;
  const isConverting = marker !== undefined && state.sleepConvertible > 0;
  const left = state.sleepLeft - 1;
  const slept = {
    ...state,
    stats: isConverting
      ? {
          ...state.stats,
          [marker]:
            state.stats[marker] +
            actionRules.sleep.pointsPerMarker *
              state.sleepMultiplier *
              (1 + activeBonus(state, 'sleepBoost')),
        }
      : state.stats,
    markers: isConverting ? rest : state.markers,
    sleepConvertible: Math.max(0, state.sleepConvertible - 1),
    sleepLeft: left,
    isSleeping: left > 0,
  };
  return addGauge(slept, state.sleepStepGauge, 'sleep');
};

const play = (state: GameState, action: QueuedAction): GameState =>
  action.type === 'work'
    ? work(state, action.target)
    : study(state, action.courseId);

// Au réveil, rejoue les gestes gardés, dans l'ordre. Un geste qui amène la jauge
// à l'heure du coucher rendort : les suivants attendent le prochain réveil. Un geste devenu
// impossible (plus d'argent...) est simplement perdu.
const replayQueued = (state: GameState): GameState => {
  let current = state;
  while (
    !current.isSleeping &&
    isPlaying(current) &&
    current.queuedActions.length > 0
  ) {
    const [action, ...rest] = current.queuedActions;
    if (action === undefined) {
      break;
    }
    current = fallAsleep(play({ ...current, queuedActions: rest }, action));
  }
  return current;
};

// Après chaque geste ou pas de sommeil : l'heure du coucher endort, un réveil
// rejoue les gestes gardés.
export const settleSleep = (state: GameState): GameState =>
  replayQueued(fallAsleep(state));
