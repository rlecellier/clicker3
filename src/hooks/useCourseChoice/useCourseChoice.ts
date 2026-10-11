import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { courses } from '@game/data';
import type { GameState } from '@game/state';
import { hasCourse } from '@game/upgrades';

export type CourseChoice = {
  chosenCourse: string | null;
  setChosenCourse: (id: string) => void;
};

// Cursus choisi par la flèche d'Étudier ; à défaut, le premier disponible.
export const selectedCourse = (state: GameState, chosenId: string | null) => {
  const available = courses.filter((course) => hasCourse(state, course.id));
  return available.find((course) => course.id === chosenId) ?? available[0];
};

// Le choix vit dans le layout du jeu : le raccourci `E` étudie le même cursus
// que le bouton, quel que soit l'onglet ouvert.
export const useCourseChoiceState = (): CourseChoice => {
  const [chosenCourse, setChosenCourse] = useState<string | null>(null);
  return { chosenCourse, setChosenCourse };
};

export const useCourseChoice = () => useOutletContext<CourseChoice>();
