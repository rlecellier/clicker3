import { useGameContext } from '@context/GameContext';
import type { FigureItem } from '@component/FigureList';
import { birthdayByAge, recapYears } from '@game/birthday';
import { formatCount, formatMoney } from '@game/format';

// Variation signée : « +3 », « -2 ».
const signed = (value: number) =>
  `${value > 0 ? '+' : ''}${formatCount(value)}`;

// Anniversaire qui attend d'être fermé : null tant qu'il n'y en a pas. Le bilan
// compare la vie à l'anniversaire précédent. Le jeu est arrêté entre-temps.
export const useBirthdayPrompt = () => {
  const { state, dispatch } = useGameContext();
  const { pendingBirthday } = state;
  const birthday = birthdayByAge(pendingBirthday?.age ?? 0);
  if (pendingBirthday === null || birthday === undefined) {
    return null;
  }
  const { recap } = pendingBirthday;
  const figures: FigureItem[] =
    recap === null
      ? []
      : [
          { label: 'Années écoulées', value: formatCount(recapYears(recap)) },
          {
            label: 'Argent',
            value: `${recap.money > 0 ? '+' : ''}${formatMoney(recap.money)}`,
          },
          { label: 'Entreprises', value: signed(recap.companies) },
          { label: 'Améliorations', value: signed(recap.upgrades) },
          {
            label: 'Réputation gagnée',
            value: signed(Math.round(recap.reputation)),
          },
        ];
  return {
    title: birthday.title,
    message: birthday.message,
    figures,
    buttonLabel: pendingBirthday.age === 75 ? 'Voir le bilan' : 'Merci !',
    onClose: () => {
      dispatch({ type: 'answerBirthday' });
    },
  };
};
