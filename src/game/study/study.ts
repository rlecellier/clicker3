import { actionRules, courses } from '@game/data';
import { withRecord } from '@game/ledger';
import { grantMarker } from '@game/markers';
import { addGauge } from '@game/period';
import type { GameState } from '@game/state';
import { hasCourse } from '@game/upgrades';

export const canStudy = (state: GameState, courseId: string) => {
  const course = courses.find((candidate) => candidate.id === courseId);
  return (
    state.status === 'playing' &&
    course !== undefined &&
    hasCourse(state, courseId) &&
    state.money >= course.cost
  );
};

// Coûte un peu d'argent, donne (peut-être) un marqueur de la stat du cursus.
export const study = (state: GameState, courseId: string): GameState => {
  const course = courses.find((candidate) => candidate.id === courseId);
  if (course === undefined || !canStudy(state, courseId)) {
    return state;
  }
  const { gauge, markerChance, markerVariance } = actionRules.study;
  const paid = withRecord(
    { ...state, money: state.money - course.cost },
    { studies: course.cost },
  );
  const withMarker = grantMarker(
    paid,
    course.stat,
    markerChance,
    markerVariance,
  );
  return addGauge(withMarker, gauge);
};
