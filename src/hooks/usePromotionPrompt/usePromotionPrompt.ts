import { useGameContext } from '@context/GameContext';
import { actionRules } from '@game/data';
import { formatMoney } from '@game/format';
import { jobById } from '@game/jobs';
import { answerPromotion, promotionCount } from '@game/promotion';
import { jobWage } from '@game/work';

const { raise } = actionRules.work.promotion;

// Le mot de la direction, un par promotion (de plus en plus chaleureux).
const messages: readonly string[] = [
  'Vous avez bien travaillé, et tard. La direction l’a remarqué et vous propose une petite promotion.',
  'Vos heures supplémentaires ne passent pas inaperçues. La direction vous propose une nouvelle promotion.',
  'La direction ne sait plus comment vous remercier. Elle vous propose, une dernière fois, une promotion.',
];

// Promotion qui attend une réponse : null tant qu’il n’y en a pas. Accepter
// augmente le salaire du poste (le chiffre affiché est celui que le travail
// rapportera), refuser ne change rien. Le jeu est arrêté entre-temps.
export const usePromotionPrompt = () => {
  const { state, dispatch } = useGameContext();
  const { pendingPromotion } = state;
  const job = jobById(pendingPromotion?.jobId ?? null);
  if (pendingPromotion === null || job === undefined) {
    return null;
  }
  const before = jobWage(state);
  const after = jobWage(answerPromotion(state, true));
  return {
    title: `Promotion (${pendingPromotion.rank + 1}/${promotionCount})`,
    message: messages[pendingPromotion.rank] ?? messages[0] ?? '',
    detail: `${job.name} : ${formatMoney(before)} → ${formatMoney(after)} par action (+${Math.round(raise * 100)} %).`,
    acceptLabel: 'Accepter',
    refuseLabel: 'Refuser',
    onAccept: () => {
      dispatch({ type: 'answerPromotion', isAccepted: true });
    },
    onRefuse: () => {
      dispatch({ type: 'answerPromotion', isAccepted: false });
    },
  };
};
