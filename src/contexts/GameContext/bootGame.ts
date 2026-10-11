import { resume } from '@game/automation';
import type { AbsenceSummary } from '@game/automation';
import { newGame } from '@game/reducer';
import { loadGame } from '@game/save';
import type { SaveStorage } from '@game/save';
import type { GameState } from '@game/state';

export type Boot = {
  state: GameState;
  absence: AbsenceSummary | null;
  // Une sauvegarde lisible existe : il y a une partie à reprendre.
  hasSave: boolean;
};

// Ouverture : charge la sauvegarde et rattrape l'absence, sinon vie neuve.
// Une sauvegarde illisible est ignorée (elle sera écrasée à la prochaine).
export const bootGame = (storage: SaveStorage, now: number): Boot => {
  const loaded = loadGame(storage);
  if (loaded === null || !loaded.ok) {
    return {
      state: { ...newGame(), lastSeenAt: now },
      absence: null,
      hasSave: false,
    };
  }
  const { state, summary } = resume(loaded.state, now);
  return {
    state,
    absence: summary.actions > 0 ? summary : null,
    hasSave: true,
  };
};
