import type { PressHandlers } from '@component/ActionButton';
import type { SplitChoice } from '@component/SplitActionButton';
import { useGameContext } from '@context/GameContext';
import { canSellSurplus } from '@game/surplus';
import {
  describeRequirement,
  formatBalance,
  formatMoney,
  statLabels,
} from '@game/format';
import { jobById } from '@game/jobs';
import { periodOutlook } from '@game/period';
import { isUnlocked } from '@game/requirements';
import { statProgress } from '@game/stats';
import { canStudy, studiableCourses } from '@game/study';
import { hasAutomation, nextUpgrade } from '@game/upgrades';
import { isOvertime, overtimeWageFactor } from '@game/overtime';
import { JOB_TARGET, canWork, jobWage } from '@game/work';
import type { GameState } from '@game/state';
import { selectedCourse, useCourseChoice } from '@hook/useCourseChoice';
import { useFeedback } from '@hook/useFeedback';
import { useGameActions } from '@hook/useGameActions';
import { accountsPath, upgradePath } from '@hook/useGameTabs';
import { useHoldRepeat } from '@hook/useHoldRepeat';
import { characterHeader } from '@view/characterHeader';
import { ENDED, NO_MONEY } from '@view/purchase';

const START_TEXT =
  'Bienvenue dans l’euro. Votre compte est crédité de 0 €, ce qui est un bon début.';
const QUEUED = 'Vous dormez. Cela sera fait au réveil.';

type BaseAction = {
  detail?: string;
  reason?: string;
  isDisabled: boolean;
  run: () => void;
};

export type ActionView = BaseAction & {
  // Action automatique du bouton, activée par un appui long.
  isAuto?: boolean;
  autoHint?: string;
  // Appui maintenu : l'action se répète à 4 clics par seconde.
  press: PressHandlers;
};

const noop = () => {};

// Prochain achat visible : l'amélioration non achetée la moins chère qui est
// déjà débloquée, sinon la moins chère avec ce qui lui manque.
const nextObjective = (
  state: GameState,
): { text: string; upgradeId?: string } => {
  const next = nextUpgrade(state);
  if (next === undefined) {
    return { text: 'Plus rien à acheter pour le moment.' };
  }
  const { requirement } = next;
  return {
    upgradeId: next.id,
    text:
      requirement === undefined || isUnlocked(state, requirement)
        ? `Prochain achat : ${next.name} (${formatMoney(next.price)})`
        : `Prochain déblocage : ${next.name}. ${describeRequirement(requirement)}`,
  };
};

// Onglet Vie : balance de la période, personnage, prochain objectif, actions
// (travailler, étudier, vendre le surplus) et leur retour, cerveau.
export const useLifeScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();
  const { feedback, setFeedback, say } = useFeedback();
  const { chosenCourse, setChosenCourse } = useCourseChoice();

  // Pendant le sommeil, travail et étude sont gardés pour le réveil.
  const sayOrQueue = (message: string, run: () => void) =>
    say(state.isSleeping ? QUEUED : message, run);

  const outlook = periodOutlook(state);
  const objective = nextObjective(state);
  const isOver = state.status === 'dead';
  const job = jobById(state.jobId);
  // Au-delà des 8 h de la journée, les heures sup. s'appliquent seules.
  const overtimeNote = isOvertime(state)
    ? ` (heures sup. +${Math.round((overtimeWageFactor(state) - 1) * 100)} %)`
    : '';

  const workAction: BaseAction = {
    detail:
      job === undefined
        ? undefined
        : `Rapporte ${formatMoney(jobWage(state))} par clic${overtimeNote}`,
    reason: isOver ? ENDED : 'Aucun emploi',
    isDisabled: !canWork(state, JOB_TARGET),
    run: sayOrQueue(
      state.jobId === 'interim' && state.period === 0
        ? 'Adéquat Intérim vous remercie de votre confiance et de votre flexibilité.'
        : 'Vous avez travaillé. Cela a été noté.',
      () => {
        actions.work(JOB_TARGET);
      },
    ),
  };

  const sellSurplusAction: BaseAction = {
    detail: 'Vend tout le stock à bas prix',
    reason: isOver ? ENDED : 'Aucun stock à vendre',
    isDisabled: !canSellSurplus(state),
    run: say('Surplus liquidé. Vos clients découvrent les soldes.', () => {
      actions.sellSurplus();
    }),
  };

  // Cursus choisi par la flèche ; à défaut, le premier étudiable.
  const availableCourses = studiableCourses(state);
  const course = selectedCourse(state, chosenCourse);
  const courseChoices: SplitChoice[] = availableCourses.map((candidate) => ({
    id: candidate.id,
    label: candidate.name,
    detail: `${formatMoney(candidate.cost)} · ${statLabels[candidate.stat]}`,
  }));

  const studyAction: BaseAction | null =
    course === undefined
      ? null
      : {
          detail: `${course.name} · ${formatMoney(course.cost)} · ${statLabels[course.stat]}`,
          reason: isOver ? ENDED : NO_MONEY,
          isDisabled: !canStudy(state, course.id),
          run: sayOrQueue(
            'Vous avez étudié. Personne ne vous l’a demandé.',
            () => {
              actions.study(course.id);
            },
          ),
        };

  // Appui long sur Travailler : active ou coupe le travail automatique, une
  // fois l'amélioration achetée. L'appui maintenu répète l'action des trois
  // boutons de l'onglet Vie ; les achats et « Recommencer » ne se répètent pas.
  const toggleAuto = () => {
    const isOn = state.autoWork;
    actions.setAuto('work', !isOn);
    setFeedback(`Travail automatique ${isOn ? 'coupé' : 'activé'}.`);
  };
  const workPress = useHoldRepeat({
    onClick: workAction.run,
    onLongPress: hasAutomation(state, 'work') ? toggleAuto : undefined,
    isDisabled: workAction.isDisabled,
  });
  const studyPress = useHoldRepeat({
    onClick: studyAction?.run ?? noop,
    isDisabled: studyAction?.isDisabled ?? true,
  });
  const sellPress = useHoldRepeat({
    onClick: sellSurplusAction.run,
    isDisabled: sellSurplusAction.isDisabled,
  });
  const work: ActionView = {
    ...workAction,
    run: workPress.onClick,
    press: workPress.press,
    ...(hasAutomation(state, 'work') && {
      isAuto: state.autoWork,
      autoHint: state.autoWork
        ? 'Appui long : couper l’automatique'
        : 'Appui long : automatique',
    }),
  };
  const sellSurplus: ActionView = {
    ...sellSurplusAction,
    run: sellPress.onClick,
    press: sellPress.press,
  };
  const studyView: ActionView | null =
    studyAction === null
      ? null
      : { ...studyAction, run: studyPress.onClick, press: studyPress.press };

  // Mini-jauge sous « Étudier » : même progression, libellé court.
  const courseProgress =
    course === undefined ? undefined : statProgress(state, course.stat);
  const studyGauge =
    course === undefined || courseProgress === undefined
      ? null
      : {
          label: `${statLabels[course.stat]} · palier ${courseProgress.tier}`,
          value: courseProgress.value,
          max: courseProgress.max,
        };

  return {
    isOver,
    header: characterHeader(state),
    // Balances de la période en cours (prévision à la clôture).
    balances: {
      money: formatBalance(outlook.money, ' €'),
      stock: formatBalance(outlook.stock),
    },
    // Récaps de Comptes que les tuiles de balance ouvrent.
    balanceLinks: {
      money: accountsPath('money'),
      stock: accountsPath('stock'),
    },
    brain: {
      count: state.markers.length,
      max: state.maxMarkers,
      isSleeping: state.isSleeping,
      // Marqueurs déjà vidés pendant ce sommeil.
      sleepProgress: state.isSleeping
        ? state.maxMarkers - state.markers.length
        : 0,
    },
    actions: { work, sellSurplus },
    study: {
      action: studyView,
      gauge: studyGauge,
      choices: courseChoices,
      selectedId: course?.id ?? '',
      select: setChosenCourse,
    },
    objective: {
      text: objective.text,
      to:
        objective.upgradeId === undefined
          ? undefined
          : upgradePath(objective.upgradeId),
    },
    // Avant la première action, le message d'accueil occupe la place du retour
    // d'action : rien ne s'affiche ni ne disparaît ailleurs dans la page.
    feedback:
      feedback ?? (state.period === 0 && state.gauge === 0 ? START_TEXT : null),
  };
};
