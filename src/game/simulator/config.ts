// Réglages du simulateur de vie (docs/game/simulateur.md).
export const simulatorConfig = {
  // Cadence d'un joueur humain : une action manuelle par seconde.
  humanCadenceMs: 1000,
  // Quand le joueur virtuel attend les automatismes, il regarde l'écran toutes
  // les 5 secondes (pour acheter dès que possible).
  waitStepMs: 5000,
  // Garde-fou : nombre maximum de pas simulés (actions et attentes).
  maxSteps: 200_000,
  // Durée cible d'une vie en jeu actif (docs/game/v1.md § 10).
  targetMinMs: 30 * 60 * 1000,
  targetMaxMs: 60 * 60 * 1000,
  // Zone morte tolérée entre deux achats ou déblocages : environ une minute.
  maxDeadZoneMs: 60 * 1000,
  // Valeur d'un article, pour estimer ce que rapporte le travail en entreprise.
  articleValue: 12,
  // Une étude n'a lieu que si l'argent couvre ce nombre de fois son coût.
  studyReserve: 3,
  // Un achat qui alourdit les dépenses fixes exige des recettes d'au moins
  // ce multiple des dépenses futures.
  expenseCover: 1.5,
} as const;
