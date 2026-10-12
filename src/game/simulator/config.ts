// Réglages du simulateur de vie (docs/game/simulateur.md).
export const simulatorConfig = {
  // Cadence d'un joueur humain : une action manuelle par seconde.
  humanCadenceMs: 1000,
  // Quand le joueur virtuel attend les automatismes, il regarde l'écran chaque
  // seconde (pour acheter dès que possible). Au rythme de l'auto, un pas
  // ne fait jamais passer deux périodes.
  waitStepMs: 1000,
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
  // Le joueur virtuel garde en caisse ce nombre de mois de dépenses fixes :
  // il ne creuse jamais de dette pour acheter.
  cashReserveMonths: 0.25,
  // Un achat qui alourdit les dépenses fixes exige des recettes d'au moins
  // ce multiple des dépenses futures.
  expenseCover: 1.5,
} as const;

// Garde-fous d'équilibrage (docs/game/propositions-equilibrage.md § 4).
export const guardrailConfig = {
  // Retirer une amélioration doit dégrader une mesure d'au moins 5 %.
  minUtility: 0.05,
  // Au moins 50 % des points de stat d'une vie sont gagnés après un boost.
  minBoostShare: 0.5,
  // Le dernier palier d'au moins une stat est atteint après cette minute.
  statLivelyMinute: 25,
  // Âge où l'on relève les recettes pour le test d'utilité.
  revenueAge: 60,
  // Exemptées du test d'utilité : formations, automatisation et employés
  // obligatoires à la progression, tableau de bord (affichage seulement).
  exemptUpgrades: [
    'premier-collaborateur',
    'directeur-transformation',
    'tableau-de-bord',
  ],
} as const;

// Échecs connus des garde-fous sur les valeurs actuelles (« genre:sujet »). Ils
// prouvent le diagnostic (docs/game/propositions-equilibrage.md § 1) ; chaque
// chantier d'équilibrage retire ceux qu'il corrige.
export const knownGuardrailFailures: readonly string[] = [
  'utility:studio-renove',
  'utility:pavillon-tilleuls',
  'utility:carnet-notes',
  'utility:application-productivite',
  'utility:cartes-visite',
  'utility:camionnette',
];
