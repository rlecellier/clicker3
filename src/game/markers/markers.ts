import type { GameState, StatId } from '@game/state';
import { activeBonus } from '@game/effects';
import { markerChanceBonus } from '@game/upgrades';

// Tolérance sur les flottants (0,3 + 0,3 + 0,3 + 0,1 doit atteindre 1).
const EPSILON = 1e-9;

/**
 * Fait avancer le marqueur de la stat de `share` (relevé par les améliorations
 * et les coups de pouce). Quand l'avancement atteint 1, un marqueur est donné :
 * c'est fixe, sans hasard. Au maximum de marqueurs, le marqueur est perdu.
 */
export const grantMarker = (
  state: GameState,
  stat: StatId,
  share: number,
): GameState => {
  const progress =
    state.markerProgress[stat] +
    share * (1 + markerChanceBonus(state) + activeBonus(state, 'markerChance'));
  const isReady = progress >= 1 - EPSILON;
  const next = {
    ...state,
    markerProgress: {
      ...state.markerProgress,
      [stat]: isReady ? Math.max(0, progress - 1) : progress,
    },
  };
  return isReady && next.markers.length < next.maxMarkers
    ? { ...next, markers: [...next.markers, stat] }
    : next;
};
