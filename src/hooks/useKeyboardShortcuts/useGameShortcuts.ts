import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGameContext } from '@context/GameContext';
import { canStudy } from '@game/study';
import { JOB_TARGET, canWork } from '@game/work';
import { selectedCourse } from '@hook/useCourseChoice';
import { useGameActions } from '@hook/useGameActions';
import { gamePath } from '@hook/useGameTabs';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Branche les raccourcis sur le jeu : navigation, travail (un clic simple,
// jamais la bascule de l'automatique) et étude du cursus sélectionné.
export const useGameShortcuts = (chosenCourse: string | null) => {
  const { state } = useGameContext();
  const actions = useGameActions();
  const navigate = useNavigate();

  const handlers = useMemo(
    () => ({
      openTab: (slug: string) => {
        void navigate(gamePath(slug));
      },
      work: () => {
        if (canWork(state, JOB_TARGET)) {
          actions.work(JOB_TARGET);
        }
      },
      study: () => {
        const course = selectedCourse(state, chosenCourse);
        if (course !== undefined && canStudy(state, course.id)) {
          actions.study(course.id);
        }
      },
    }),
    [state, actions, navigate, chosenCourse],
  );

  useKeyboardShortcuts(handlers);
};
