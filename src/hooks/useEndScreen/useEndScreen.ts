import { useNavigate } from 'react-router';
import type { FigureItem } from '@component/FigureList';
import {
  formatAge,
  formatCount,
  formatDecimal,
  formatMoney,
} from '@game/format';
import { screenPaths } from '@hook/useGameFlow';
import { useLifeSummary } from '@hook/useGameImpact';

// « You died » : le bilan calculé depuis l'état et le geste pour rejouer.
export const useEndScreen = () => {
  const summary = useLifeSummary();
  const navigate = useNavigate();

  const figures: FigureItem[] = [
    { label: 'Entreprises possédées', value: formatCount(summary.companies) },
    { label: 'Argent', value: formatMoney(summary.money) },
    { label: 'Âge', value: formatAge(summary.age) },
    { label: 'Réputation', value: formatDecimal(summary.reputation) },
  ];

  return {
    figures,
    // Rejouer commence par le choix du premier emploi.
    replay: () => {
      void navigate(screenPaths.newLife);
    },
  };
};
