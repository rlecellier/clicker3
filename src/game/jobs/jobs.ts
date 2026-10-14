import { actionRules, findById, jobs } from '@game/data';
import type { Job } from '@game/data';
import { isRequirementMet } from '@game/requirements';
import { canSpendReputation, spendReputation } from '@game/reputation';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

export const jobById = (id: string | null) => findById(jobs, id);

// Salaire d'un mois (une journée type) : la journée de travail normale, au tarif
// normal, sans heures supplémentaires ni malus d'âge.
export const monthlyWage = (job: Job) =>
  (job.salary * actionRules.work.overtime.regularMinutes) /
  actionRules.work.minutes;

// Les emplois proposés au début d'une vie : ni prérequis ni réputation à payer.
export const startingJobs = jobs.filter(
  (job) => job.requirement === undefined && job.cost === 0,
);

export const canChangeJob = (state: GameState, id: string) => {
  const job = jobById(id);
  return (
    isPlaying(state) &&
    job !== undefined &&
    state.jobId !== id &&
    canSpendReputation(state, job.cost) &&
    isRequirementMet(state, job.requirement)
  );
};

// Si l'emploi ne peut pas être pris, l'état est rendu inchangé.
export const changeJob = (state: GameState, id: string): GameState => {
  const job = jobById(id);
  return job === undefined || !canChangeJob(state, id)
    ? state
    : { ...spendReputation(state, job.cost), jobId: id };
};
