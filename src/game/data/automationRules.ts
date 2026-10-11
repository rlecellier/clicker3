// Valeurs provisoires de l'automatisation, à caler au simulateur (V1-24).
export const automationRules = {
  // Rythme de référence d'un joueur actif : une action manuelle par seconde.
  referenceIntervalMs: 1000,
  // Rythme de l'auto rapporté au manuel : ¼ (ADR 0005), soit une action
  // toutes les 4 s ; 8 h d'absence valent 2 h de jeu actif.
  speedFactor: 0.25,
  // Gain d'une action automatique rapporté à une action manuelle : moitié.
  yieldFactor: 0.5,
} as const;
