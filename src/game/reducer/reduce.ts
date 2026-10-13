import { afterAction } from '@game/afterAction';
import { autoTick, setAuto } from '@game/automation';
import { buyBoost } from '@game/boosts';
import { buyCompany, buyWarehouse } from '@game/companies';
import { findById, startState } from '@game/data';
import { unlockDistrict } from '@game/districts';
import { changeJob, startingJobs } from '@game/jobs';
import { readMail } from '@game/mail';
import { markAllSeen, markSeen } from '@game/novelty';
import { addGauge } from '@game/period';
import { answerPromotion, isPromotionPending } from '@game/promotion';
import { triggerEvents } from '@game/events';
import { queueAction } from '@game/sleep';
import { study } from '@game/study';
import { sellSurplus } from '@game/surplus';
import { buyUpgrade, cancelUpgrade } from '@game/upgrades';
import { work } from '@game/work';
import type { GameState } from '@game/state';
import type { GameAction } from './actions';

// Nouvelle vie : l'état de départ, avec les événements déjà présents au départ.
// Un emploi qui n'est pas un emploi de départ est ignoré (on garde celui par défaut).
export const newGame = (jobId?: string): GameState =>
  markAllSeen(
    triggerEvents({
      ...startState,
      jobId: findById(startingJobs, jobId)?.id ?? startState.jobId,
    }),
  );

const applyAction = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'addGauge': {
      return addGauge(state, action.amount, action.kind);
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
    case 'buyWarehouse': {
      return buyWarehouse(state);
    }
    case 'sellSurplus': {
      return sellSurplus(state);
    }
    case 'buyUpgrade': {
      return buyUpgrade(state, action.id);
    }
    case 'buyBoost': {
      return buyBoost(state, action.id);
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
    case 'readMail': {
      return readMail(state);
    }
    case 'answerPromotion': {
      return answerPromotion(state, action.isAccepted);
    }
    case 'markSeen': {
      return markSeen(state, action.tab);
    }
    case 'restart': {
      return newGame(action.jobId);
    }
  }
};

// Tant qu'une promotion attend une réponse, le jeu est arrêté : seules la
// réponse, la lecture du courrier, les nouveautés vues et la nouvelle vie passent.
const passesDuringPromotion = new Set<GameAction['type']>([
  'answerPromotion',
  'readMail',
  'markSeen',
  'restart',
]);

// Sommeil, phase de vie et événements suivent chaque action (`afterAction`).
export const reduce = (state: GameState, action: GameAction): GameState =>
  isPromotionPending(state) && !passesDuringPromotion.has(action.type)
    ? state
    : afterAction(applyAction(state, action));
