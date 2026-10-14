import type { GameState } from '@game/state';

export type Activity = 'work' | 'study' | 'idle' | 'over';

// Ce que fait le personnage : ce qu'il a fait en dernier dans la période
// (dernière part de la jauge de temps). Sans action depuis le début de la
// période, il ne fait rien de particulier.
export const currentActivity = (state: GameState): Activity =>
  state.status === 'dead'
    ? 'over'
    : (state.gaugeSegments.at(-1)?.kind ?? 'idle');
