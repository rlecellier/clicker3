// Valeurs des actions, calées au simulateur (V1-24, docs/game/equilibrage.md).
export const actionRules = {
  work: {
    // Coût en jauge de temps.
    gauge: 10,
    // Chance d'obtenir un marqueur, et variance du hasard lissé.
    markerChance: 0.3,
    markerVariance: 0.5,
    // Heures supplémentaires automatiques (issue #166). Une période est une
    // journée type de 24 h : 8 h de travail, 8 h de sommeil, 8 h libres. La
    // jauge fait 70 et un sommeil en coûte 40 : il en reste 30, que l'on compte
    // pour les 8 h de travail, celles que rémunère le salaire. Au-delà, le
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
    markerVariance: 0.3,
  },
  sleep: {
    // Coût en jauge de temps d'un sommeil complet (cerveau plein), réparti
    // sur les marqueurs.
    gauge: 40,
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
