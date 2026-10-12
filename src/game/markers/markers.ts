import { next, smoothedRoll } from '@game/random';
import type { GameState, StatId } from '@game/state';
import { markerChanceBonus } from '@game/upgrades';

/**
 * Tente de donner un marqueur de la stat. La chance est lissée (V1-04), puis
 * tirée. Les améliorations relèvent la chance. Au maximum de marqueurs, le marqueur est perdu. La graine avance dans
 * tous les cas, pour rester déterministe.
 */
export const grantMarker = (
  state: GameState,
  stat: StatId,
  chance: number,
  variance: number,
): GameState => {
  const [probability, afterChance] = smoothedRoll(
    state,
    chance * (1 + markerChanceBonus(state)),
    variance,
  );
  const [draw, afterDraw] = next(afterChance);
  return draw >= probability || afterDraw.markers.length >= afterDraw.maxMarkers
    ? afterDraw
    : { ...afterDraw, markers: [...afterDraw.markers, stat] };
};
