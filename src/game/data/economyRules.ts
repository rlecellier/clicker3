// Valeurs de l'économie, calées au simulateur (V1-24, docs/game/equilibrage.md).
export const economyRules = {
  // Réputation gagnée par article vendu.
  reputationPerSale: 0.02,
  // Réputation perdue par commerce en rupture de stock, et par impayé.
  stockoutPenalty: 0.5,
  unpaidPenalty: 2,
  // Bonus de production ou de vente d'une entreprise par action de travail
  // faite dedans pendant la période (0,5 = +50 %).
  workBonus: 0.5,
  // Marqueurs gagnés en travaillant dans une entreprise.
  companyMarkerStat: 'gestion',
  // Vente directe du surplus de stock, à bas prix.
  surplusPrice: 4,
  surplusGauge: 5,
} as const;
