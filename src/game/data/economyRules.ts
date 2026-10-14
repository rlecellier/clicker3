// Valeurs de l'économie, calées au simulateur (V1-24, docs/game/equilibrage.md).
export const economyRules = {
  // Réputation gagnée par article vendu.
  reputationPerSale: 0.02,
  // Réputation perdue par commerce en rupture de stock, et par impayé.
  stockoutPenalty: 0.5,
  unpaidPenalty: 2,
  // Train de vie (courses, transport, téléphone), prélevé chaque période avec
  // le loyer. Une période est un mois : repères mensuels de 1999 (issue #166).
  // Il monte avec le logement ; un logement absent de la table paie le tarif
  // de base.
  baseLivingCost: 470,
  livingCosts: {
    'studio-renove': 520,
    'pavillon-tilleuls': 670,
    'loft-pole': 920,
  } as Readonly<Record<string, number>>,
  // Coût employeur minimal d'un salarié (SMIC 1999 chargé, par mois) : aucun
  // employé ne coûte moins (contrôlé par data.test.ts).
  minimumEmployeeCost: 1300,
  // Intérêt prélevé à chaque période sur un solde négatif (0,015 = 1,5 %, 18 % par an, axe D de l’issue #167).
  debtInterestRate: 0.015,
  // Bonus de production ou de vente d'une entreprise par action de travail
  // faite dedans pendant la période (0,5 = +50 %).
  workBonus: 0.5,
  // Marqueurs gagnés en travaillant dans une entreprise.
  companyMarkerStat: 'gestion',
  // Vente directe du surplus de stock, à bas prix.
  surplusPrice: 4,
  surplusMinutes: 100,
  // Petit entrepôt supplémentaire, toujours achetable : l'issue de secours
  // quand la production dépasse le stock que l'on peut ranger.
  warehouse: { baseCost: 160, growth: 1.03, capacity: 35 },
} as const;

// Nombre de périodes terminées gardées dans l'historique du ledger.
export const ledgerHistoryLength = 3;
