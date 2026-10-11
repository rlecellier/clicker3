import { jobs } from '@game/data';
import { isUnlocked } from '@game/requirements';
import { canSpendReputation, spendReputation } from '@game/reputation';
import type { GameState } from '@game/state';

export const jobById = (id: string | null) =>
  jobs.find((candidate) => candidate.id === id);

export const canChangeJob = (state: GameState, id: string) => {
  const job = jobById(id);
  return (
    state.status === 'playing' &&
    job !== undefined &&
    state.jobId !== id &&
    canSpendReputation(state, job.cost) &&
    (job.requirement === undefined || isUnlocked(state, job.requirement))
  );
};

// Si l'emploi ne peut pas être pris, l'état est rendu inchangé.
export const changeJob = (state: GameState, id: string): GameState => {
  const job = jobById(id);
  return job === undefined || !canChangeJob(state, id)
    ? state
    : { ...spendReputation(state, job.cost), jobId: id };
};
