import { GrowthPage } from '@page/GrowthPage';
import { LifePage } from '@page/LifePage';
import { useLifeSlice } from '@hook/useLifeSlice';

// Onglet « Vie » : le jeu complet en Jeunesse, le mini-jeu avant 18 ans sinon.
export const LifeTabPage = () => {
  const { hasGrowth } = useLifeSlice();
  return hasGrowth ? <GrowthPage /> : <LifePage />;
};
