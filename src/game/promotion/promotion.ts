import { actionRules, journalLimit } from '@game/data';
import { jobById } from '@game/jobs';
import type { GameState } from '@game/state';

const { promotion } = actionRules.work;

// Nombre de promotions qu'un emploi peut offrir.
export const promotionCount = promotion.overtimeActions.length;

// Une action de travail à l'emploi vient d'être faite en heures
// supplémentaires : elle compte vers la prochaine promotion.
export const countOvertime = (state: GameState, jobId: string): GameState => ({
  ...state,
  overtimeActions: {
    ...state.overtimeActions,
    [jobId]: (state.overtimeActions[jobId] ?? 0) + 1,
  },
});

// Le jeu attend la réponse du joueur à une promotion.
export const isPromotionPending = (state: GameState) =>
  state.pendingPromotion !== null;

// Propose la prochaine promotion de l'emploi quand le seuil d'heures sup. est
// atteint. Une seule offre à la fois ; rend l'état inchangé sinon. À appeler
// après chaque action (`afterAction`).
export const offerPromotion = (state: GameState): GameState => {
  const job = jobById(state.jobId);
  if (job === undefined || isPromotionPending(state)) {
    return state;
  }
  const rank = state.promotionsOffered[job.id] ?? 0;
  const threshold = promotion.overtimeActions[rank];
  return threshold !== undefined &&
    (state.overtimeActions[job.id] ?? 0) >= threshold
    ? { ...state, pendingPromotion: { jobId: job.id, rank } }
    : state;
};

// Réponse du joueur : l'offre est consommée dans les deux cas. Accepter
// augmente le salaire de l'emploi, refuser ne change rien. La réponse est
// écrite au courrier. Sans offre en attente, l'état est rendu inchangé.
export const answerPromotion = (
  state: GameState,
  isAccepted: boolean,
): GameState => {
  const { pendingPromotion } = state;
  const job = jobById(pendingPromotion?.jobId ?? null);
  if (pendingPromotion === null || job === undefined) {
    return state;
  }
  const text = isAccepted
    ? `Vous avez accepté la promotion : vous restez ${job.name}, payé ${Math.round(promotion.raise * 100)} % de plus.`
    : `Vous avez refusé la promotion : vous restez ${job.name}, au même salaire.`;
  return {
    ...state,
    pendingPromotion: null,
    promotionsOffered: {
      ...state.promotionsOffered,
      [job.id]: pendingPromotion.rank + 1,
    },
    jobSalaryFactors: isAccepted
      ? {
          ...state.jobSalaryFactors,
          [job.id]:
            (state.jobSalaryFactors[job.id] ?? 1) * (1 + promotion.raise),
        }
      : state.jobSalaryFactors,
    mailReceived: state.mailReceived + 1,
    events: [
      ...state.events,
      {
        period: state.period,
        id: `promotion-${job.id}-${pendingPromotion.rank}`,
        text,
      },
    ].slice(-journalLimit),
  };
};
