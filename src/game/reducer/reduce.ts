import { unlockDistrict } from '@game/districts';
import { addGauge } from '@game/period';
import type { GameState } from '@game/state';
import type { GameAction } from './actions';

export const reduce = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'addGauge': {
      return addGauge(state, action.amount);
    }
    case 'unlockDistrict': {
      return unlockDistrict(state, action.id);
    }
  }
};
