import { useCallback, useEffect, useState } from 'react';
import type { ListItem } from '@component/ItemList';
import type { SplitChoice } from '@component/SplitActionButton';
import { useGameContext } from '@context/GameContext';
import { canSellSurplus } from '@game/surplus';
import { jobs } from '@game/data';
import {
  checkRequirement,
  describeRequirement,
  formatAge,
  formatBalance,
  formatCompact,
  formatCount,
  formatDate,
  formatDecimal,
  formatMoney,
  formatPhase,
  statLabels,
} from '@game/format';
import { canChangeJob } from '@game/jobs';
import { canSpendReputation, reputationTierProgress } from '@game/reputation';
import { isUnlocked } from '@game/requirements';
import { statProgress } from '@game/stats';
import { canStudy, studiableCourses } from '@game/study';
import { ageOf, dateOf } from '@game/time';
import { hasAutomation, nextUpgrade } from '@game/upgrades';
import { JOB_TARGET, canWork } from '@game/work';
import type { GameState, StatId } from '@game/state';
import { selectedCourse, useCourseChoice } from '@hook/useCourseChoice';
import { useGameActions } from '@hook/useGameActions';
import { upgradePath } from '@hook/useGameTabs';
import { useHoldRepeat } from '@hook/useHoldRepeat';
import type { PressHandlers } from '@hook/useHoldRepeat';

const FEEDBACK_MS = 2500;
const START_TEXT =
  'Bienvenue dans l’euro. Votre compte est crédité de 0 €, ce qui est un bon début.';
const ENDED = 'Partie terminée';
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

const statIds = Object.keys(statLabels) as StatId[];

// Prochain achat visible : l'amélioration non achetée la moins chère qui est
// déjà débloquée, sinon la moins chère avec ce qui lui manque.
const nextObjective = (
  state: GameState,
): { text: string; upgradeId?: string } => {
  const next = nextUpgrade(state);
  if (next === undefined) {
    return { text: 'Plus rien à acheter pour le moment.' };
  }
  return {
    upgradeId: next.id,
    text:
      next.requirement === undefined || isUnlocked(state, next.requirement)
        ? `Prochain achat : ${next.name} (${formatMoney(next.price)})`
        : `Prochain déblocage : ${next.name}. ${describeRequirement(next.requirement)}`,
  };
};

// Tout ce que la page de jeu affiche et déclenche, prêt à brancher.
export const useGameScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();
  const [feedback, setFeedback] = useState<string | null>(null);
  const { chosenCourse, setChosenCourse } = useCourseChoice();

  useEffect(() => {
    if (feedback === null) {
      return;
    }
    const timer = setTimeout(() => {
      setFeedback(null);
    }, FEEDBACK_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [feedback]);

  const say = useCallback(
    (message: string, run: () => void) => () => {
      run();
      setFeedback(message);
    },
    [],
  );

  // Pendant le sommeil, travail et étude sont gardés pour le réveil.
  const sayOrQueue = (message: string, run: () => void) =>
    say(state.isSleeping ? QUEUED : message, run);

  const objective = nextObjective(state);
  const isOver = state.status === 'dead';
  const job = jobs.find((candidate) => candidate.id === state.jobId);

  const workAction: BaseAction = {
    detail:
      job === undefined ? undefined : `Salaire : ${formatMoney(job.salary)}`,
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

  const jobItems: ListItem[] = jobs.map((candidate) => {
    const isCurrent = candidate.id === state.jobId;
    const conditions =
      isCurrent || candidate.requirement === undefined
        ? undefined
        : checkRequirement(state, candidate.requirement);
    const hasMissing = conditions?.some((condition) => !condition.isMet);
    const isShortOnReputation = !canSpendReputation(state, candidate.cost);
    const reason =
      !isCurrent && hasMissing !== true && isShortOnReputation
        ? 'Réputation insuffisante'
        : undefined;
    return {
      id: candidate.id,
      title: candidate.name,
      detail: `Salaire ${formatMoney(candidate.salary)}${
        candidate.cost > 0
          ? ` · ${formatCount(candidate.cost)} de réputation`
          : ''
      }`,
      badge: isCurrent ? 'Actuel' : undefined,
      actionLabel: 'Prendre',
      isDisabled: !canChangeJob(state, candidate.id),
      reason,
      conditions,
      onAction: say('Votre nouveau poste a été communiqué en interne.', () => {
        actions.changeJob(candidate.id);
      }),
    };
  });

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
          reason: isOver ? ENDED : 'Argent insuffisant',
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

  const skillBars = statIds.map((id) => {
    const progress = statProgress(state, id);
    return {
      id,
      label: `${statLabels[id]} · palier ${progress.tier} · ${progress.isMax ? 'max' : `${formatCount(progress.points)} pts`}`,
      value: progress.value,
      max: progress.max,
    };
  });

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

  // Même format que les compétences ; le palier se calcule sur le cumul gagné.
  const reputation = reputationTierProgress(state);
  const reputationBar = {
    id: 'reputation',
    label: `Réputation · palier ${reputation.tier} · ${reputation.name} · ${
      reputation.isMax ? 'max' : `${formatCount(state.reputationEarned)} gagnés`
    }`,
    value: reputation.value,
    max: reputation.max,
  };

  return {
    isOver,
    header: {
      name: state.characterName,
      age: formatAge(ageOf(state)),
      date: formatDate(dateOf(state)),
      phase: formatPhase(state),
    },
    counters: {
      stock: `${formatCompact(state.stock)} / ${formatCompact(state.stockCapacity)}`,
      exactStock: `${formatCount(state.stock)} / ${formatCount(state.stockCapacity)}`,
      stockBalance: formatBalance(
        state.stock - state.ledger.current.stockStart,
      ),
      reputation: formatDecimal(state.reputation),
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
    stats: [...skillBars, reputationBar],
    actions: { work, sellSurplus },
    study: {
      action: studyView,
      gauge: studyGauge,
      choices: courseChoices,
      selectedId: course?.id ?? '',
      select: setChosenCourse,
    },
    jobs: jobItems,
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
