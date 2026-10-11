import { actionRules, jobMarkerStat } from '@game/data';
import { jobById } from '@game/jobs';
import { grantMarker } from '@game/markers';
import { addGauge } from '@game/period';
import { gainReputation } from '@game/reputation';
import type { GameState } from '@game/state';

// Cible du travail : l'emploi, ou (à partir de V1-07) l'id d'une entreprise.
export const JOB_TARGET = 'job';

export const canWork = (state: GameState, target: string) =>
  state.status === 'playing' &&
  target === JOB_TARGET &&
  jobById(state.jobId) !== undefined;

// Salaire et réputation de l'emploi, chance de marqueur, puis temps qui passe.
export const work = (state: GameState, target: string = JOB_TARGET) => {
  const job = jobById(state.jobId);
  if (job === undefined || !canWork(state, target)) {
    return state;
  }
  const { gauge, markerChance, markerVariance } = actionRules.work;
  const paid = gainReputation(
    { ...state, money: state.money + job.salary },
    job.reputation,
  );
  const withMarker = grantMarker(
    paid,
    jobMarkerStat,
    markerChance,
    markerVariance,
  );
  return addGauge(withMarker, gauge);
};
