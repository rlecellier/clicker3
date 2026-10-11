import { companyById, ownedCount } from '@game/companies';
import {
  actionRules,
  automationRules,
  economyRules,
  jobMarkerStat,
} from '@game/data';
import { activeBonus } from '@game/effects';
import { jobById } from '@game/jobs';
import { withRecord } from '@game/ledger';
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

// Coefficient des gains : le malus de vieillesse ne touche que le travail
// manuel (v1.md § 4), l'action automatique rapporte moitié moins à tout âge.
const gainFactor = (state: GameState, isAuto: boolean) =>
  isAuto ? automationRules.yieldFactor : manualFactor(state);

// Travailler à son emploi : salaire et réputation de l'emploi.
const workAtJob = (
  state: GameState,
  jobId: string | null,
  isAuto: boolean,
): GameState => {
  const job = jobById(jobId);
  if (job === undefined) {
    return state;
  }
  const factor = gainFactor(state, isAuto);
  const wage = Math.round(
    job.salary * factor * (state.jobSalaryFactors[job.id] ?? 1),
  );
  return gainReputation(
    withRecord({ ...state, money: state.money + wage }, { wages: wage }),
    job.reputation * state.workReputationMultiplier * factor,
  );
};

// Travailler dans une de ses entreprises : bonus sur la période (voir economy).
const workAtCompany = (
  state: GameState,
  id: string,
  isAuto: boolean,
): GameState => ({
  ...state,
  workBoosts: {
    ...state.workBoosts,
    [id]: (state.workBoosts[id] ?? 0) + gainFactor(state, isAuto),
  },
});

// Gain de l'action, chance de marqueur, puis temps qui passe. `isAuto`
// distingue l'action automatique de l'action manuelle.
export const work = (
  state: GameState,
  target: string = JOB_TARGET,
  isAuto = false,
): GameState => {
  if (!canWork(state, target)) {
    return state;
  }
  const { gauge, markerChance, markerVariance } = actionRules.work;
  const isAtJob = target === JOB_TARGET;
  const done = isAtJob
    ? workAtJob(state, state.jobId, isAuto)
    : workAtCompany(state, target, isAuto);
  const withMarker = grantMarker(
    done,
    isAtJob ? jobMarkerStat : economyRules.companyMarkerStat,
    markerChance,
    markerVariance,
  );
  return addGauge(withMarker, gauge * (1 + activeBonus(state, 'workSlow')));
};
