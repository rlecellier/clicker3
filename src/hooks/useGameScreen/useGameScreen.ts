import { useCallback, useEffect, useState } from 'react';
import type { ListItem } from '@component/ItemList';
import type { SplitChoice } from '@component/SplitActionButton';
import { useGameContext } from '@context/GameContext';
import { canSellSurplus } from '@game/surplus';
import { courses, jobs, statTierThresholds } from '@game/data';
import {
  checkRequirement,
  describeReputationTier,
  describeRequirement,
  formatAge,
  formatCount,
  formatDate,
  formatDecimal,
  formatMoney,
  formatPhase,
  statLabels,
} from '@game/format';
import { canChangeJob } from '@game/jobs';
import { canSpendReputation } from '@game/reputation';
import { isUnlocked } from '@game/requirements';
import { tierOf } from '@game/stats';
import { canStudy } from '@game/study';
import { ageOf, dateOf } from '@game/time';
import { hasAutomation, hasCourse, nextUpgrade } from '@game/upgrades';
import { JOB_TARGET, canWork } from '@game/work';
import type { GameState, StatId } from '@game/state';
import { useGameActions } from '@hook/useGameActions';
import { useLongPress } from '@hook/useLongPress';

const FEEDBACK_MS = 2500;
const START_TEXT =
  'Bienvenue dans l’euro. Votre compte est crédité de 0 €, ce qui est un bon début.';
const ENDED = 'Partie terminée';
const QUEUED = 'Vous dormez. Cela sera fait au réveil.';

export type ActionView = {
  detail?: string;
  reason?: string;
  isDisabled: boolean;
  run: () => void;
  // Action automatique du bouton, activée par un appui long.
  isAuto?: boolean;
  autoHint?: string;
  press?: ReturnType<typeof useLongPress>['press'];
};

const statIds = Object.keys(statLabels) as StatId[];

// Prochain achat visible : l'amélioration non achetée la moins chère qui est
// déjà débloquée, sinon la moins chère avec ce qui lui manque.
const nextObjective = (state: GameState): string => {
  const next = nextUpgrade(state);
  if (next === undefined) {
    return 'Plus rien à acheter pour le moment.';
  }
  return next.requirement === undefined || isUnlocked(state, next.requirement)
    ? `Prochain achat : ${next.name} (${formatMoney(next.price)})`
    : `Prochain déblocage : ${next.name}. ${describeRequirement(next.requirement)}`;
};

// Tout ce que la page de jeu affiche et déclenche, prêt à brancher.
export const useGameScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [chosenCourse, setChosenCourse] = useState<string | null>(null);

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

  const isOver = state.status === 'dead';
  const job = jobs.find((candidate) => candidate.id === state.jobId);

  const workAction: ActionView = {
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

  const sellSurplus: ActionView = {
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

  // Cursus choisi par la flèche ; à défaut, le premier disponible.
  const availableCourses = courses.filter((course) =>
    hasCourse(state, course.id),
  );
  const course =
    availableCourses.find((candidate) => candidate.id === chosenCourse) ??
    availableCourses[0];
  const courseChoices: SplitChoice[] = availableCourses.map((candidate) => ({
    id: candidate.id,
    label: candidate.name,
    detail: `${formatMoney(candidate.cost)} · ${statLabels[candidate.stat]}`,
  }));

  const studyAction: ActionView | null =
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
  // fois l'amélioration achetée.
  const toggleAuto = () => {
    const isOn = state.autoWork;
    actions.setAuto('work', !isOn);
    setFeedback(`Travail automatique ${isOn ? 'coupé' : 'activé'}.`);
  };
  const workPress = useLongPress(
    workAction.run,
    hasAutomation(state, 'work') ? toggleAuto : undefined,
  );
  const work: ActionView = hasAutomation(state, 'work')
    ? {
        ...workAction,
        run: workPress.onClick,
        press: workPress.press,
        isAuto: state.autoWork,
        autoHint: state.autoWork
          ? 'Appui long : couper l’automatique'
          : 'Appui long : automatique',
      }
    : workAction;

  return {
    isOver,
    intro: state.period === 0 && state.gauge === 0 ? START_TEXT : null,
    header: {
      name: state.characterName,
      age: formatAge(ageOf(state)),
      date: formatDate(dateOf(state)),
      phase: formatPhase(state),
    },
    counters: {
      stock: `${formatCount(state.stock)} / ${formatCount(state.stockCapacity)}`,
      reputation: formatDecimal(state.reputation),
      reputationTier: describeReputationTier(state),
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
    stats: statIds.map((id) => {
      const tier = tierOf(state, id);
      const thresholds = statTierThresholds[id];
      const next = thresholds[tier];
      const start = tier === 0 ? 0 : (thresholds[tier - 1] ?? 0);
      const points = state.stats[id];
      return {
        id,
        label: `${statLabels[id]} · palier ${tier} · ${next === undefined ? 'max' : `${formatCount(points)} pts`}`,
        value: next === undefined ? 1 : points - start,
        max: next === undefined ? 1 : next - start,
      };
    }),
    actions: { work, sellSurplus },
    study: {
      action: studyAction,
      choices: courseChoices,
      selectedId: course?.id ?? '',
      select: setChosenCourse,
    },
    jobs: jobItems,
    objective: nextObjective(state),
    feedback,
  };
};
