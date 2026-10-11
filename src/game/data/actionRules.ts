// Valeurs provisoires des actions, à équilibrer au simulateur (V1-15, V1-24).
export const actionRules = {
  work: {
    // Coût en jauge de temps.
    gauge: 10,
    // Chance d'obtenir un marqueur, et variance du hasard lissé.
    markerChance: 0.3,
    markerVariance: 0.5,
  },
  study: {
    gauge: 15,
    markerChance: 0.7,
    markerVariance: 0.3,
  },
  sleep: {
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
