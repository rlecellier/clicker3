// Valeurs des actions, calées au simulateur (V1-24, docs/game/equilibrage.md).
export const actionRules = {
  work: {
    // Durée d'une action, en minutes d'éveil : la jauge de temps en est faite,
    // donc une heure de sommeil en moins ajoute 60 minutes d'actions. Nombre
    // libre, sans palier (docs/game/sommeil.md).
    minutes: 200,
    // Part de marqueur par action : 0,3 donne un marqueur toutes les 3 à 4 actions.
    markerChance: 0.3,
    // Heures supplémentaires automatiques (issue #166). La journée de travail
    // payée par le salaire compte `regularMinutes` de travail ; au-delà, le
    // travail de la période est payé en heures supplémentaires, sans
    // déblocage : +25 % à partir de 600 minutes de travail, +35 % à partir de
    // 1 000 (le code du travail dit +25 % puis +50 % ; recalé au simulateur).
    // Chaque action en heures sup. dure aussi 35 % de plus : on est fatigué, la
    // période passe plus vite.
    overtime: {
      regularMinutes: 600,
      tiers: [
        { from: 600, wage: 1.25 },
        { from: 1000, wage: 1.35 },
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
    // Durée d'une étude, en minutes d'éveil.
    minutes: 300,
    markerChance: 0.7,
  },
  sleep: {
    // Une période est une journée de 24 h : le sommeil en prend une part (base
    // de la tranche de vie, puis améliorations), le reste est l'éveil que mesure
    // la jauge (docs/game/sommeil.md). Bornes du sommeil, en heures.
    hoursPerPeriod: 24,
    hours: { min: 4, max: 12 },
    // Points de stat par marqueur converti, avant le logement et le rendement.
    pointsPerMarker: 1,
  },
  senior: {
    // Coefficient des gains des actions manuelles une fois senior.
    manualFactor: 0.5,
  },
} as const;

// Stat qui reçoit les marqueurs gagnés en travaillant à son emploi.
export const jobMarkerStat = 'metier';
