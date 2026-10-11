import { useCallback, useEffect, useState } from 'react';
import type { ListItem } from '@component/ItemList';
import { useGameContext } from '@context/GameContext';
import { canSellSurplus } from '@game/surplus';
import { courses, jobs, statTierThresholds } from '@game/data';
import {
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
import { canSleep } from '@game/sleep';
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

  const isOver = state.status === 'dead';
  const job = jobs.find((candidate) => candidate.id === state.jobId);

  const workAction: ActionView = {
    detail:
      job === undefined ? undefined : `Salaire : ${formatMoney(job.salary)}`,
    reason: isOver ? ENDED : 'Aucun emploi',
    isDisabled: !canWork(state, JOB_TARGET),
    run: say(
      state.jobId === 'interim' && state.period === 0
        ? 'Adéquat Intérim vous remercie de votre confiance et de votre flexibilité.'
        : 'Vous avez travaillé. Cela a été noté.',
      () => {
        actions.work(JOB_TARGET);
      },
    ),
  };

  const sleepAction: ActionView = {
    detail: 'Convertit les marqueurs en points',
    reason: isOver ? ENDED : 'Aucun marqueur à convertir',
    isDisabled: !canSleep(state),
    run: say(
      'Vous récupérez. Votre employeur le sait et en prend note.',
      () => {
        actions.sleep();
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
    const missing =
      candidate.requirement !== undefined &&
      !isUnlocked(state, candidate.requirement)
        ? describeRequirement(candidate.requirement)
        : undefined;
    const isShortOnReputation = !canSpendReputation(state, candidate.cost);
    const reason = isCurrent
      ? undefined
      : (missing ??
        (isShortOnReputation ? 'Réputation insuffisante' : undefined));
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
      onAction: say('Votre nouveau poste a été communiqué en interne.', () => {
        actions.changeJob(candidate.id);
      }),
    };
  });

  const courseItems: ListItem[] = courses
    .filter((course) => hasCourse(state, course.id))
    .map((course) => ({
      id: course.id,
      title: course.name,
      detail: `Coût : ${formatMoney(course.cost)} · ${statLabels[course.stat]}`,
      actionLabel: 'Étudier',
      isDisabled: !canStudy(state, course.id),
      reason: isOver ? ENDED : 'Argent insuffisant',
      onAction: say('Vous avez étudié. Personne ne vous l’a demandé.', () => {
        actions.study(course.id);
      }),
    }));

  // Appui long sur Travailler ou Dormir : active ou coupe l'action
  // automatique, une fois l'amélioration achetée.
  const toggleAuto = (action: 'work' | 'sleep') => {
    const isOn = action === 'work' ? state.autoWork : state.autoSleep;
    const name = action === 'work' ? 'Travail' : 'Sommeil';
    return () => {
      actions.setAuto(action, !isOn);
      setFeedback(`${name} automatique ${isOn ? 'coupé' : 'activé'}.`);
    };
  };
  const workPress = useLongPress(
    workAction.run,
    hasAutomation(state, 'work') ? toggleAuto('work') : undefined,
  );
  const sleepPress = useLongPress(
    sleepAction.run,
    hasAutomation(state, 'sleep') ? toggleAuto('sleep') : undefined,
  );
  const withAuto = (
    view: ActionView,
    action: 'work' | 'sleep',
    gesture: ReturnType<typeof useLongPress>,
  ): ActionView =>
    hasAutomation(state, action)
      ? {
          ...view,
          run: gesture.onClick,
          press: gesture.press,
          isAuto: action === 'work' ? state.autoWork : state.autoSleep,
          autoHint: (action === 'work' ? state.autoWork : state.autoSleep)
            ? 'Appui long : couper l’automatique'
            : 'Appui long : automatique',
        }
      : view;
  const work = withAuto(workAction, 'work', workPress);
  const sleep = withAuto(sleepAction, 'sleep', sleepPress);

  return {
    isOver,
    intro: state.period === 0 && state.gauge === 0 ? START_TEXT : null,
    header: {
      name: state.characterName,
      age: formatAge(ageOf(state)),
      date: formatDate(dateOf(state)),
      phase: formatPhase(state),
    },
    gauge: { value: state.gauge, max: state.gaugeCapacity },
    counters: {
      money: formatMoney(state.money),
      stock: `${formatCount(state.stock)} / ${formatCount(state.stockCapacity)}`,
      reputation: formatDecimal(state.reputation),
    },
    markers: { count: state.markers.length, max: state.maxMarkers },
    stats: statIds.map((id) => {
      const tier = tierOf(state, id);
      const thresholds = statTierThresholds[id];
      const next = thresholds[tier];
      const start = tier === 0 ? 0 : (thresholds[tier - 1] ?? 0);
      const points = state.stats[id];
      return {
        id,
        label: `${statLabels[id]} · palier ${tier} · ${formatCount(points)} pts`,
        value: next === undefined ? 1 : points - start,
        max: next === undefined ? 1 : next - start,
      };
    }),
    actions: { work, sleep, sellSurplus },
    jobs: jobItems,
    courses: courseItems,
    objective: nextObjective(state),
    feedback,
  };
};
