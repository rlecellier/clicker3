import { actionRules, courses } from '@game/data';
import { grantMarker } from '@game/markers';
import { addGauge } from '@game/period';
import { isUnlocked } from '@game/requirements';
import type { GameState } from '@game/state';

export const canStudy = (state: GameState, courseId: string) => {
  const course = courses.find((candidate) => candidate.id === courseId);
  return (
    state.status === 'playing' &&
    course !== undefined &&
    state.money >= course.cost &&
    (course.requirement === undefined || isUnlocked(state, course.requirement))
  );
};

// Coûte un peu d'argent, donne (peut-être) un marqueur de la stat du cursus.
export const study = (state: GameState, courseId: string): GameState => {
  const course = courses.find((candidate) => candidate.id === courseId);
  if (course === undefined || !canStudy(state, courseId)) {
    return state;
  }
  const { gauge, markerChance, markerVariance } = actionRules.study;
  const paid = { ...state, money: state.money - course.cost };
  const withMarker = grantMarker(
    paid,
    course.stat,
    markerChance,
    markerVariance,
  );
  return addGauge(withMarker, gauge);
};
