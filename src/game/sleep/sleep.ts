import { actionRules } from '@game/data';
import { learningFactor } from '@game/day';
import { activeBonus } from '@game/effects';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

// La nuit, à la clôture de la période : tous les marqueurs du cerveau sont
// convertis en points de stat d'un coup (logement, coup de pouce et rendement
// d'apprentissage compris), sans pause. Le nombre de marqueurs convertis est
// gardé pour le bilan de nuit.
export const sleep = (state: GameState): GameState => {
  if (!isPlaying(state)) {
    return state;
  }
  const points =
    actionRules.sleep.pointsPerMarker *
    state.sleepMultiplier *
    (1 + activeBonus(state, 'sleepBoost')) *
    learningFactor(state);
  const stats = { ...state.stats };
  for (const marker of state.markers) {
    stats[marker] += points;
  }
  return {
    ...state,
    stats,
    markers: [],
    lastNightMarkers: state.markers.length,
  };
};
