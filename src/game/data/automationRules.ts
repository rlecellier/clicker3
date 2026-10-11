// Valeurs de l'automatisation, calées au simulateur (V1-24, docs/game/equilibrage.md).
export const automationRules = {
  // Rythme de référence d'un joueur actif : une action manuelle par seconde.
  referenceIntervalMs: 1000,
  // Rythme de l'auto rapporté au manuel : ×2, soit deux actions par seconde
  // (une action toutes les 500 ms).
  speedFactor: 2,
  // Durée réelle d'un sommeil complet, quelle que soit la capacité du cerveau :
  // les marqueurs se vident à intervalles réguliers pendant ce temps.
  sleepDurationMs: 500,
  // Gain d'une action automatique rapporté à une action manuelle : moitié.
  yieldFactor: 0.5,
} as const;
