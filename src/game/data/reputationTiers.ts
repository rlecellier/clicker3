export type ReputationTier = {
  name: string;
  // Réputation gagnée cumulée à atteindre.
  earned: number;
};

// Du palier 0 au palier 3 (docs/game/ton-et-univers.md). Seuils calés en V1-24 (docs/game/equilibrage.md).
export const reputationTiers: readonly ReputationTier[] = [
  { name: 'Inconnu', earned: 0 },
  { name: 'Partenaire de confiance', earned: 6 },
  { name: 'Acteur majeur', earned: 100 },
  { name: 'Vous êtes devenu une marque', earned: 170 },
];
