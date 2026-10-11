import { unlockDistrict } from '@game/districts';
import { changeJob } from '@game/jobs';
import { addGauge } from '@game/period';
import { sleep } from '@game/sleep';
import { study } from '@game/study';
import { work } from '@game/work';
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
    case 'work': {
      return work(state, action.target);
    }
    case 'study': {
      return study(state, action.courseId);
    }
    case 'sleep': {
      return sleep(state);
    }
    case 'changeJob': {
      return changeJob(state, action.id);
    }
  }
};
