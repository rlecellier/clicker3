import { useState } from 'react';
import { useOutletContext } from 'react-router';
import type { GameState } from '@game/state';
import { studiableCourses } from '@game/study';

export type CourseChoice = {
  chosenCourse: string | null;
  setChosenCourse: (id: string) => void;
};

// Cursus choisi par la flèche d'Étudier ; à défaut (choix absent ou devenu
// inutile), le premier étudiable. `undefined` quand plus rien n'est étudiable.
export const selectedCourse = (state: GameState, chosenId: string | null) => {
  const available = studiableCourses(state);
  return available.find((course) => course.id === chosenId) ?? available[0];
};

// Le choix vit dans le layout du jeu : le raccourci `E` étudie le même cursus
// que le bouton, quel que soit l'onglet ouvert.
export const useCourseChoiceState = (): CourseChoice => {
  const [chosenCourse, setChosenCourse] = useState<string | null>(null);
  return { chosenCourse, setChosenCourse };
};

export const useCourseChoice = () => useOutletContext<CourseChoice>();
