import { companyById, ownedCount } from '@game/companies';
import {
  actionRules,
  automationRules,
  economyRules,
  jobMarkerStat,
} from '@game/data';
import { activeBonus } from '@game/effects';
import { jobById } from '@game/jobs';
import { grantMarker } from '@game/markers';
import {
  isOvertime,
  overtimeGaugeFactor,
  overtimeWageFactor,
} from '@game/overtime';
import { addGauge } from '@game/period';
import { manualFactor } from '@game/phases';
import { countOvertime } from '@game/promotion';
import { gainReputation } from '@game/reputation';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

// Cible du travail : l'emploi, ou (à partir de V1-07) l'id d'une entreprise.
export const JOB_TARGET = 'job';

export const canWork = (state: GameState, target: string) => {
  if (!isPlaying(state)) {
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

// Salaire d'une action de travail à l'emploi, tous modificateurs appliqués,
// heures supplémentaires comprises : ce que l'action rapporte vraiment (0 sans
// emploi).
export const jobWage = (state: GameState, isAuto = false) => {
  const job = jobById(state.jobId);
  return job === undefined
    ? 0
    : Math.round(
        job.salary *
          overtimeWageFactor(state) *
          gainFactor(state, isAuto) *
          (state.jobSalaryFactors[job.id] ?? 1),
      );
};

// Travailler à son emploi : salaire (versé à la clôture) et réputation de
// l'emploi.
const workAtJob = (state: GameState, isAuto: boolean): GameState => {
  const job = jobById(state.jobId);
  if (job === undefined) {
    return state;
  }
  const factor = gainFactor(state, isAuto);
  const wage = jobWage(state, isAuto);
  // Une action payée en heures supplémentaires compte vers la promotion.
  const counted = isOvertime(state) ? countOvertime(state, job.id) : state;
  return gainReputation(
    {
      ...counted,
      wagesDue: {
        ...counted.wagesDue,
        [job.id]: (state.wagesDue[job.id] ?? 0) + wage,
      },
    },
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
    ? workAtJob(state, isAuto)
    : workAtCompany(state, target, isAuto);
  const withMarker = grantMarker(
    done,
    isAtJob ? jobMarkerStat : economyRules.companyMarkerStat,
    markerChance,
    markerVariance,
  );
  return addGauge(
    withMarker,
    gauge * (1 + activeBonus(state, 'workSlow')) * overtimeGaugeFactor(state),
    'work',
  );
};
