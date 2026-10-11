import { autoTick, setAuto } from '@game/automation';
import { buyCompany } from '@game/companies';
import { startState } from '@game/data';
import { unlockDistrict } from '@game/districts';
import { changeJob } from '@game/jobs';
import { addGauge } from '@game/period';
import { triggerEvents } from '@game/events';
import { updatePhase } from '@game/phases';
import { queueAction, settleSleep } from '@game/sleep';
import { study } from '@game/study';
import { sellSurplus } from '@game/surplus';
import { buyUpgrade, cancelUpgrade } from '@game/upgrades';
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
      return state.isSleeping
        ? queueAction(state, action)
        : work(state, action.target);
    }
    case 'study': {
      return state.isSleeping
        ? queueAction(state, action)
        : study(state, action.courseId);
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
    case 'cancelUpgrade': {
      return cancelUpgrade(state, action.id);
    }
    case 'setAuto': {
      return setAuto(state, action.action, action.isEnabled);
    }
    case 'autoTick': {
      return autoTick(state, action.elapsedMs);
    }
    case 'restart': {
      return newGame();
    }
  }
};

// La phase de vie suit les achats et les événements sont évalués après chaque
// action (ceux de fin de période l'ont déjà été dans `endPeriod`).
// Un cerveau plein endort le personnage ; au réveil, ses gestes gardés se rejouent.
export const reduce = (state: GameState, action: GameAction): GameState => {
  const applied = settleSleep(applyAction(state, action));
  return triggerEvents(updatePhase(applied));
};
