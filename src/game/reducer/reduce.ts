import { afterAction } from '@game/afterAction';
import { autoTick, setAuto } from '@game/automation';
import { buyBoost } from '@game/boosts';
import { buyCompany, buyWarehouse } from '@game/companies';
import { birthSituations, findById, lifeSlices, startState } from '@game/data';
import { askFor, chooseEvent, doActivity, explore } from '@game/earlyChildhood';
import { unlockDistrict } from '@game/districts';
import { changeJob, startingJobs } from '@game/jobs';
import { answerBirthday, isBirthdayPending } from '@game/birthday';
import { grow, hasGrowth, sliceGame } from '@game/lifeSlices';
import { readMail } from '@game/mail';
import { markAllSeen, markSeen } from '@game/novelty';
import { openPlacement } from '@game/placements';
import { addGauge } from '@game/period';
import { acknowledgeFinalUpgrade } from '@game/finale';
import { answerPromotion, isPromotionPending } from '@game/promotion';
import { triggerEvents } from '@game/events';
import { study } from '@game/study';
import { sellSurplus } from '@game/surplus';
import { buyUpgrade, cancelUpgrade } from '@game/upgrades';
import { work } from '@game/work';
import type { GameState, LifeSliceId } from '@game/state';
import type { GameAction } from './actions';

// Nouvelle vie : l'état de départ, ses 18 ans à fêter, avec les événements déjà présents au départ.
// Un emploi qui n'est pas un emploi de départ est ignoré (on garde celui par défaut).
// Une tranche avant 18 ans n'a ni emploi, ni événement, ni anniversaire :
// seulement son compteur. Les tranches adultes reprennent le jeu complet avec
// leur état de départ (`sliceGame`).
export const newGame = (
  jobId?: string,
  lifeSlice: LifeSliceId = startState.lifeSlice,
  birthSituation?: string,
  seed: number = startState.child.seed,
): GameState => {
  const slice = findById(lifeSlices, lifeSlice);
  // Une situation inconnue est ignorée (on garde celle par défaut).
  const situation =
    findById(birthSituations, birthSituation)?.id ?? startState.birthSituation;
  if (slice?.start != null) {
    return { ...sliceGame(slice.start, lifeSlice), birthSituation: situation };
  }
  if (slice?.growth != null) {
    return {
      ...startState,
      lifeSlice,
      birthSituation: situation,
      child: { ...startState.child, seed },
    };
  }
  return markAllSeen(
    triggerEvents({
      ...startState,
      birthSituation: situation,
      jobId: findById(startingJobs, jobId)?.id ?? startState.jobId,
      // Le départ est le premier anniversaire : 18 ans, pas encore de bilan.
      pendingBirthday: { age: startState.life.startAge, recap: null },
    }),
  );
};

const applyAction = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'addGauge': {
      return addGauge(state, action.amount, action.kind);
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
    case 'openPlacement': {
      return openPlacement(state, action.id);
    }
    case 'readMail': {
      return readMail(state);
    }
    case 'answerPromotion': {
      return answerPromotion(state, action.isAccepted);
    }
    case 'answerBirthday': {
      return answerBirthday(state);
    }
    case 'acknowledgeFinalUpgrade': {
      return acknowledgeFinalUpgrade(state);
    }
    case 'markSeen': {
      return markSeen(state, action.tab);
    }
    case 'grow': {
      return grow(state);
    }
    case 'doActivity': {
      return doActivity(state, action.id);
    }
    case 'explore': {
      return explore(state, action.place);
    }
    case 'askFor': {
      return askFor(state, action.wishId);
    }
    case 'chooseEvent': {
      return chooseEvent(state, action.choice);
    }
    case 'restart': {
      return newGame(
        action.jobId,
        action.lifeSlice,
        action.birthSituation,
        action.seed,
      );
    }
  }
};

// Tant qu'une promotion ou un anniversaire attend une réponse, le jeu est arrêté : seules la
// réponse, la lecture du courrier, les nouveautés vues et la nouvelle vie passent.
const passesDuringPromotion = new Set<GameAction['type']>([
  'answerPromotion',
  'answerBirthday',
  'readMail',
  'acknowledgeFinalUpgrade',
  'markSeen',
  'restart',
]);

// Sommeil, phase de vie et événements suivent chaque action (`afterAction`).
export const reduce = (state: GameState, action: GameAction): GameState => {
  if (
    (isPromotionPending(state) || isBirthdayPending(state)) &&
    !passesDuringPromotion.has(action.type)
  ) {
    return state;
  }
  const next = applyAction(state, action);
  // Avant 18 ans, ni sommeil, ni événements du monde, ni anniversaire : seuls
  // les gestes de la tranche comptent (la petite enfance a ses propres événements).
  return hasGrowth(next) ? next : afterAction(next);
};
