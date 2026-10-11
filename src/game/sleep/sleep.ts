import { actionRules } from '@game/data';
import { addGauge } from '@game/period';
import type { GameState, StatId } from '@game/state';

export const canSleep = (state: GameState) =>
  state.status === 'playing' && state.markers.length > 0;

// Convertit tous les marqueurs en points de stat, selon le logement.
// Sans marqueur, dormir ne sert à rien : l'action est refusée.
export const sleep = (state: GameState): GameState => {
  if (!canSleep(state)) {
    return state;
  }
  const { gauge, pointsPerMarker } = actionRules.sleep;
  const stats = { ...state.stats };
  const counts = new Map<StatId, number>();
  for (const marker of state.markers) {
    counts.set(marker, (counts.get(marker) ?? 0) + 1);
  }
  for (const [stat, count] of counts) {
    stats[stat] += Math.round(count * pointsPerMarker * state.sleepMultiplier);
  }
  return addGauge({ ...state, stats, markers: [] }, gauge);
};
