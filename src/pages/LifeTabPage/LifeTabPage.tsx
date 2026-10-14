import { EarlyChildhoodPage } from '@page/EarlyChildhoodPage';
import { GrowthPage } from '@page/GrowthPage';
import { LifePage } from '@page/LifePage';
import { useLifeSlice } from '@hook/useLifeSlice';

// Onglet « Vie » : le jeu complet en Jeunesse, la petite enfance et son propre
// écran, le mini-jeu d'un bouton pour les autres tranches avant 18 ans.
export const LifeTabPage = () => {
  const { hasGrowth, slice } = useLifeSlice();
  if (slice?.id === 'earlyChildhood') {
    return <EarlyChildhoodPage />;
  }
  return hasGrowth ? <GrowthPage /> : <LifePage />;
};
