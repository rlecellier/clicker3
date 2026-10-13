import type { GameState } from '@game/state';

export type Activity = 'work' | 'study' | 'sleep' | 'idle' | 'over';

// Ce que fait le personnage : il dort, ou bien il fait ce qu'il a fait en
// dernier dans la période (dernière part de la jauge de temps). Sans action
// depuis le début de la période, il ne fait rien de particulier.
export const currentActivity = (state: GameState): Activity => {
  if (state.status === 'dead') {
    return 'over';
  }
  if (state.isSleeping) {
    return 'sleep';
  }
  const last = state.gaugeSegments.at(-1);
  return last === undefined || last.kind === 'sleep' ? 'idle' : last.kind;
};
