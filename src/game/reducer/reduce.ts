import { buyCompany } from '@game/companies';
import { startState } from '@game/data';
import { unlockDistrict } from '@game/districts';
import { changeJob } from '@game/jobs';
import { addGauge } from '@game/period';
import { triggerEvents } from '@game/events';
import { updatePhase } from '@game/phases';
import { sleep } from '@game/sleep';
import { study } from '@game/study';
import { sellSurplus } from '@game/surplus';
import { buyUpgrade } from '@game/upgrades';
import { work } from '@game/work';
import type { GameState } from '@game/state';
import type { GameAction } from './actions';

// Nouvelle vie : l'état de départ, avec les événements déjà présents au départ.
export const newGame = (): GameState => triggerEvents(startState);

const applyAction = (state: GameState, action: GameAction): GameState => {
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
    case 'buyCompany': {
      return buyCompany(state, action.id);
    }
    case 'sellSurplus': {
      return sellSurplus(state);
    }
    case 'buyUpgrade': {
      return buyUpgrade(state, action.id);
    }
    case 'restart': {
      return newGame();
    }
  }
};

// La phase de vie suit les achats et les événements sont évalués après chaque
// action (ceux de fin de période l'ont déjà été dans `endPeriod`).
export const reduce = (state: GameState, action: GameAction): GameState =>
  triggerEvents(updatePhase(applyAction(state, action)));
