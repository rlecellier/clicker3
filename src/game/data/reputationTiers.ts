export type ReputationTier = {
  name: string;
  // Réputation gagnée cumulée à atteindre.
  earned: number;
};

// Du palier 0 au palier 3 (docs/game/ton-et-univers.md). Seuils provisoires.
export const reputationTiers: readonly ReputationTier[] = [
  { name: 'Inconnu', earned: 0 },
  { name: 'Partenaire de confiance', earned: 10 },
  { name: 'Acteur majeur', earned: 30 },
  { name: 'Vous êtes devenu une marque', earned: 80 },
];
