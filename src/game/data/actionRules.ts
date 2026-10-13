// Valeurs des actions, calées au simulateur (V1-24, docs/game/equilibrage.md).
export const actionRules = {
  work: {
    // Coût en jauge de temps.
    gauge: 10,
    // Part de marqueur par action : 0,3 donne un marqueur toutes les 3 à 4 actions.
    markerChance: 0.3,
    // Heures supplémentaires automatiques (issue #166). Une période est une
    // journée type de 24 h : 8 h de travail, 8 h de sommeil, 8 h libres. La
    // jauge fait 70 et un sommeil de 8 h en coûte 23 : il en reste 47, dont 30
    // que l'on compte pour les 8 h de travail, celles que rémunère le salaire.
    // Au-delà, le
    // travail de la période est payé en heures supplémentaires, sans déblocage :
    // +25 % à partir de 30 de jauge de travail, +35 % à partir de 50 (le code du
    // travail dit +25 % puis +50 % ; recalé au simulateur). Chaque action en
    // heures sup. coûte aussi 35 % de jauge de plus : on est fatigué, la période passe plus
    // vite et le sommeil arrive plus tôt.
    overtime: {
      regularGauge: 30,
      tiers: [
        { from: 30, wage: 1.25 },
        { from: 50, wage: 1.35 },
      ],
      gaugeSurcharge: 0.35,
    },
    // Promotions (issue #195) : un emploi offre jusqu'à trois promotions,
    // chacune quand le joueur a fait ce nombre cumulé d'actions de travail en
    // heures supplémentaires à cet emploi. Le jeu s'arrête : accepter garde le
    // poste, payé `raise` de plus (cumulé) ; refuser ne change rien.
    promotion: {
      overtimeActions: [10, 30, 60],
      raise: 0.1,
    },
  },
  study: {
    gauge: 15,
    markerChance: 0.7,
  },
  sleep: {
    // Durée du sommeil quotidien, au choix du joueur : court, moyen ou long
    // (heures entières, jamais plus de 8 h : une période est une journée type
    // de 24 h).
    hours: { min: 4, max: 8, default: 8 },
    hoursPerPeriod: 24,
    // Une période commence au réveil de 7 h. On se couche plus tard quand on dort
    // moins (heures de l'horloge, issue #202).
    dayStartHour: 7,
    // `left` : marqueurs que le sommeil laisse dans le cerveau, qui est vidé du
    // reste. Long (8 h) vide tout : c'est la durée de l'apprentissage. Moyen
    // (6 h) en laisse un, court (4 h) deux : on gagne du temps éveillé pour
    // l'argent, quand on est riche, mais on apprend moins. Les marqueurs non
    // vidés restent pour le sommeil suivant. Point d'extension des futures
    // améliorations (issue sur l'apprentissage selon l'âge).
    schedule: {
      4: { name: 'Court', bed: 2, wake: 6, left: 2 },
      6: { name: 'Moyen', bed: 1, wake: 7, left: 1 },
      8: { name: 'Long', bed: 23, wake: 7, left: 0 },
    },
    // Points de stat par marqueur consommé, avant le multiplicateur du logement.
    pointsPerMarker: 1,
  },
  senior: {
    // Coefficient des gains des actions manuelles une fois senior.
    manualFactor: 0.5,
  },
} as const;

// Stat qui reçoit les marqueurs gagnés en travaillant à son emploi.
export const jobMarkerStat = 'metier';
