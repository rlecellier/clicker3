import { companyById, ownedCount } from '@game/companies';
import { actionRules, economyRules, jobMarkerStat } from '@game/data';
import { jobById } from '@game/jobs';
import { grantMarker } from '@game/markers';
import { addGauge } from '@game/period';
import { manualFactor } from '@game/phases';
import { gainReputation } from '@game/reputation';
import type { GameState } from '@game/state';

// Cible du travail : l'emploi, ou (à partir de V1-07) l'id d'une entreprise.
export const JOB_TARGET = 'job';

export const canWork = (state: GameState, target: string) => {
  if (state.status !== 'playing') {
    return false;
  }
  return target === JOB_TARGET
    ? jobById(state.jobId) !== undefined
    : companyById(target) !== undefined && ownedCount(state, target) > 0;
};

// Travailler à son emploi : salaire et réputation de l'emploi.
const workAtJob = (state: GameState, jobId: string | null): GameState => {
  const job = jobById(jobId);
  if (job === undefined) {
    return state;
  }
  const factor = manualFactor(state);
  return gainReputation(
    { ...state, money: state.money + Math.round(job.salary * factor) },
    job.reputation * state.workReputationMultiplier * factor,
  );
};

// Travailler dans une de ses entreprises : bonus sur la période (voir economy).
const workAtCompany = (state: GameState, id: string): GameState => ({
  ...state,
  workBoosts: {
    ...state.workBoosts,
    [id]: (state.workBoosts[id] ?? 0) + manualFactor(state),
  },
});

// Gain de l'action, chance de marqueur, puis temps qui passe.
export const work = (
  state: GameState,
  target: string = JOB_TARGET,
): GameState => {
  if (!canWork(state, target)) {
    return state;
  }
  const { gauge, markerChance, markerVariance } = actionRules.work;
  const isAtJob = target === JOB_TARGET;
  const done = isAtJob
    ? workAtJob(state, state.jobId)
    : workAtCompany(state, target);
  const withMarker = grantMarker(
    done,
    isAtJob ? jobMarkerStat : economyRules.companyMarkerStat,
    markerChance,
    markerVariance,
  );
  return addGauge(withMarker, gauge);
};
