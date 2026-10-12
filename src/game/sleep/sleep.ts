import { actionRules, automationRules } from '@game/data';
import { addGauge } from '@game/period';
import { isPlaying } from '@game/state';
import type { GameState, QueuedAction } from '@game/state';
import { study } from '@game/study';
import { work } from '@game/work';

// Nombre maximum de gestes gardés pendant un sommeil.
const MAX_QUEUED = 50;

// Délai entre deux marqueurs vidés : un sommeil complet dure toujours
// `sleepDurationMs`, quelle que soit la capacité du cerveau.
export const sleepStepMs = (state: GameState) =>
  automationRules.sleepDurationMs / Math.max(1, state.maxMarkers);

// Pendant le sommeil, un geste manuel est gardé pour le réveil. Les gestes
// automatiques ne passent pas par là : ils attendent.
export const queueAction = (
  state: GameState,
  action: QueuedAction,
): GameState =>
  !isPlaying(state) || state.queuedActions.length >= MAX_QUEUED
    ? state
    : { ...state, queuedActions: [...state.queuedActions, action] };

// Le cerveau plein, le personnage s'endort (et plus rien d'autre ne se fait
// tant qu'il dort). Rend l'état inchangé sinon.
export const fallAsleep = (state: GameState): GameState =>
  isPlaying(state) &&
  !state.isSleeping &&
  state.maxMarkers > 0 &&
  state.markers.length >= state.maxMarkers
    ? { ...state, isSleeping: true }
    : state;

// Un pas de sommeil : le plus ancien marqueur est converti en points de stat,
// selon le logement, et le temps passe. Le dernier marqueur consommé réveille.
// Le sommeil complet coûte `actionRules.sleep.gauge` de jauge de temps.
export const sleepStep = (state: GameState): GameState => {
  if (!state.isSleeping || !isPlaying(state)) {
    return state;
  }
  const [marker, ...rest] = state.markers;
  if (marker === undefined) {
    return { ...state, isSleeping: false };
  }
  const { gauge, pointsPerMarker } = actionRules.sleep;
  const slept = {
    ...state,
    stats: {
      ...state.stats,
      [marker]: state.stats[marker] + pointsPerMarker * state.sleepMultiplier,
    },
    markers: rest,
    isSleeping: rest.length > 0,
  };
  return addGauge(slept, gauge / state.maxMarkers);
};

const play = (state: GameState, action: QueuedAction): GameState =>
  action.type === 'work'
    ? work(state, action.target)
    : study(state, action.courseId);

// Au réveil, rejoue les gestes gardés, dans l'ordre. Un geste qui remplit le
// cerveau rendort : les suivants attendent le prochain réveil. Un geste devenu
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

// Après chaque geste ou pas de sommeil : un cerveau plein endort, un réveil
// rejoue les gestes gardés.
export const settleSleep = (state: GameState): GameState =>
  replayQueued(fallAsleep(state));
