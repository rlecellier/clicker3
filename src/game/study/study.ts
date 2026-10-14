import { actionRules, courses, findById, statTierThresholds } from '@game/data';
import { activeBonus } from '@game/effects';
import { withRecord } from '@game/ledger';
import { grantMarker } from '@game/markers';
import { addGauge } from '@game/period';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';
import { tierOf } from '@game/stats';
import { hasCourse } from '@game/upgrades';

export const courseById = (id: string) => findById(courses, id);

// Un cursus est étudiable s'il est débloqué et que sa stat n'est pas déjà au
// dernier palier : au-delà, payer ne rapporterait plus rien. Source unique pour
// les règles, le choix du cursus, le bouton et le raccourci.
export const isStudiable = (state: GameState, courseId: string) => {
  const course = courseById(courseId);
  return (
    course !== undefined &&
    hasCourse(state, courseId) &&
    tierOf(state, course.stat) < statTierThresholds[course.stat].length
  );
};

export const studiableCourses = (state: GameState) =>
  courses.filter((course) => isStudiable(state, course.id));

export const canStudy = (state: GameState, courseId: string) => {
  const course = courseById(courseId);
  return (
    isPlaying(state) &&
    course !== undefined &&
    isStudiable(state, courseId) &&
    state.money >= course.cost
  );
};

// Coûte un peu d'argent, donne (peut-être) un marqueur de la stat du cursus.
export const study = (state: GameState, courseId: string): GameState => {
  const course = courseById(courseId);
  if (course === undefined || !canStudy(state, courseId)) {
    return state;
  }
  const { minutes, markerChance } = actionRules.study;
  const paid = withRecord(
    { ...state, money: state.money - course.cost },
    { studies: course.cost, studiesBy: { [course.id]: course.cost } },
  );
  // Un séminaire donne une chance de marqueur de plus à chaque étude.
  const attempts = 1 + activeBonus(state, 'studyMarkers');
  let withMarker = paid;
  for (let attempt = 0; attempt < attempts; attempt++) {
    withMarker = grantMarker(withMarker, course.stat, markerChance);
  }
  return addGauge(withMarker, minutes, 'study');
};
