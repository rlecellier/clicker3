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

const ratio = (owned: number, total: number) =>
  `${formatCount(owned)} sur ${formatCount(total)}`;

// « You died » : le bilan calculé depuis l'état et le geste pour rejouer.
export const useEndScreen = () => {
  const summary = useLifeSummary();
  const navigate = useNavigate();

  const figures: FigureItem[] = [
    {
      label: 'Argent gagné sur toute la vie',
      value: formatMoney(summary.earned),
    },
    {
      label: 'Argent à la fin (tous comptes)',
      value: formatMoney(summary.money),
    },
    { label: 'dont capital placé', value: formatMoney(summary.capital) },
    {
      label: 'Entreprises possédées',
      value: ratio(summary.companies, summary.companiesTotal),
    },
    {
      label: 'Améliorations achetées',
      value: ratio(summary.upgradesOwned, summary.upgradesTotal),
    },
    { label: 'Logement', value: summary.housing },
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
