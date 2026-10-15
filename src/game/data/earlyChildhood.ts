import type { ChildAxisId, ChildPlaceId } from '@game/state';

// Règles de la petite enfance (docs/game/petite-enfance.md). Une période y est
// un trimestre : 24 trimestres font les 6 ans de la tranche.
export const childRules = {
  // Actions qui remplissent un trimestre (chaque action en vaut une).
  quarterCapacity: 14,
  quarters: 24,
  // Un axe reste entre −limit et +limit.
  axisLimit: 100,
  // Un axe poussé au-delà de ce seuil, d'un côté, débloque des activités.
  axisThreshold: 25,
  // Les événements de la tranche : entre `min` et `max`, au plus un par
  // trimestre et espacés de `spacing` trimestres ; `chance` est la probabilité
  // d'en ouvrir un à chaque trimestre éligible.
  events: { min: 4, max: 7, spacing: 2, chance: 0.4 },
  // Traits gardés à la sortie : au plus trois.
  traitLimit: 3,
  // Attention des parents : plafond, et part du temps libre rendue à chaque
  // trimestre (disponibilité des parents divisée par ce nombre).
  attentionMax: 100,
  attentionRegenDivisor: 5,
  // Attention dépensée pour réclamer un objet.
  askCost: 40,
  // Trimestres avant qu'un souhait « plus tard » soit exaucé.
  laterDelay: 2,
  // Marge de moyens en dessous de laquelle la réponse est « plus tard ».
  laterMargin: 25,
  // Les relations : le lien de départ est 30 % de l'affection du parent ;
  // jouer avec quelqu'un le renforce de `playBond`. Aux paliers de lien, une
  // activité s'ouvre (`activity`), la personne pousse en douce l'axe qu'elle
  // aime à chaque trimestre (`bonus`, de `bonusAmount`) et amortit les
  // mauvaises passes (`support` : un lien perdu est divisé par deux).
  relations: {
    startShare: 0.3,
    playBond: 2,
    tiers: { activity: 25, bonus: 50, support: 75 },
    bonusAmount: 2,
  },
} as const;

export type ChildAxis = {
  id: ChildAxisId;
  name: string;
  // Pôle positif (axe > 0) et pôle négatif (axe < 0).
  positive: string;
  negative: string;
};

export const childAxes: readonly ChildAxis[] = [
  { id: 'energy', name: 'Énergie', positive: 'Vif', negative: 'Posé' },
  {
    id: 'sociability',
    name: 'Sociabilité',
    positive: 'Extraverti',
    negative: 'Introverti',
  },
  {
    id: 'mind',
    name: 'Esprit',
    positive: 'Touche-à-tout',
    negative: 'Appliqué',
  },
  {
    id: 'temperament',
    name: 'Tempérament',
    positive: 'Sentiment',
    negative: 'Raison',
  },
];

export type ChildObject = {
  id: string;
  name: string;
  // Pictogramme de la bande d'objets et de l'inventaire.
  icon: string;
  // Ce que c'est, dans la voix du jeu ; ce qu'il débloque se déduit des
  // activités et des événements.
  description: string;
  // Éveil (nombre d'actions) auquel l'entourage le donne ; absent pour un objet
  // qu'on trouve en fouillant ou qu'on réclame.
  giftAt?: number;
};

// Les premiers objets, offerts à mesure que l'éveil monte. Les événements
// (issue suivante) en donneront d'autres.
export const childObjects: readonly ChildObject[] = [
  {
    id: 'teddy',
    name: 'Nounours',
    icon: '🧸',
    description:
      'Un nounours à l’effigie de personne. Il écoute, ne répond jamais et accepte les décisions les plus discutables.',
    giftAt: 4,
  },
  {
    id: 'rattle',
    name: 'Hochet',
    icon: '🔔',
    description:
      'Un hochet. Il produit du bruit sur demande, ce qui en fait le premier outil de communication du foyer.',
    giftAt: 10,
  },
  {
    id: 'cubes',
    name: 'Cubes',
    icon: '🧱',
    description:
      'Des cubes. Leur seule fonction connue est d’être empilés, puis renversés, dans cet ordre.',
    giftAt: 18,
  },
  {
    id: 'books',
    name: 'Livre d’images',
    icon: '📖',
    description:
      'Un livre d’images. Le texte n’est pas lu, mais le service constate un intérêt pour les images.',
    giftAt: 28,
  },
  {
    id: 'spoon',
    name: 'Cuillère',
    icon: '🥄',
    description: 'Une cuillère. Elle ne se rend pas toujours à destination.',
    giftAt: 38,
  },
  {
    id: 'ball',
    name: 'Ballon',
    icon: '⚽',
    description: 'Un ballon. Il roule, l’enfant court, personne ne gagne.',
    giftAt: 50,
  },
  {
    id: 'shapeBox',
    name: 'Boîte à formes',
    icon: '🔷',
    description:
      'Une boîte à formes. Chaque forme a son trou. L’enfant n’a pas pris connaissance de la règle.',
    giftAt: 64,
  },
  {
    id: 'cat',
    name: 'Le chat',
    icon: '🐱',
    description:
      'Le chat. Il n’a pas été consulté sur son rôle dans la famille.',
    giftAt: 80,
  },
  // Trouvailles de la maison.
  {
    id: 'jamJar',
    name: 'Pot de confiture',
    icon: '🍓',
    description: 'Un pot de confiture, entamé à l’insu de tous.',
  },
  {
    id: 'pots',
    name: 'Casseroles',
    icon: '🍳',
    description: 'Des casseroles. Une fanfare à un seul musicien.',
  },
  {
    id: 'remote',
    name: 'Télécommande',
    icon: '📺',
    description:
      'Une télécommande. Elle ne commande plus rien d’utile depuis son adoption.',
  },
  {
    id: 'shoes',
    name: 'Chaussures de papa',
    icon: '👞',
    description: 'Les chaussures de papa. Taille 44. Tout est dit.',
  },
  // Trouvailles du dehors.
  {
    id: 'stick',
    name: 'Bâton',
    icon: '🪵',
    description: 'Un bâton. Il a trouvé son enfant.',
  },
  {
    id: 'snail',
    name: 'Escargot',
    icon: '🐌',
    description:
      'Un escargot. Il n’est pas pressé. L’enfant non plus, désormais.',
  },
  {
    id: 'chalk',
    name: 'Craies',
    icon: '🖍️',
    description: 'Des craies. Le sol de la cour a changé de propriétaire.',
  },
  {
    id: 'treasure',
    name: 'Trésor de la cour',
    icon: '💎',
    description:
      'Un trésor de la cour : un caillou. Sa valeur est sentimentale.',
  },
  // Objets réclamés aux parents.
  {
    id: 'bike',
    name: 'Vélo',
    icon: '🚲',
    description:
      'Un vélo. Les roues stabilisatrices sont comprises, la dignité non.',
  },
  {
    id: 'logicGame',
    name: 'Jeu de logique',
    icon: '🧩',
    description:
      'Un jeu de logique. Il récompense la patience, ce que les parents apprécient aussi.',
  },
  {
    id: 'costume',
    name: 'Déguisement',
    icon: '🎭',
    description:
      'Un déguisement. Il permet d’être quelqu’un d’autre sans formulaire.',
  },
];

// Un lieu de fouille : débloqué à un âge, il rend un objet toutes les `steps`
// fouilles, tiré parmi `finds` qu'on n'a pas encore. Le joueur voit les lieux,
// pas leur contenu.
export type ChildPlace = {
  id: ChildPlaceId;
  name: string;
  // Trimestre à partir duquel on peut y aller.
  minQuarter: number;
  steps: number;
  finds: readonly string[];
};

export const childPlaces: readonly ChildPlace[] = [
  {
    id: 'home',
    name: 'Fouiller la maison',
    minQuarter: 12,
    steps: 5,
    finds: ['jamJar', 'pots', 'remote', 'shoes'],
  },
  {
    id: 'outside',
    name: 'Explorer dehors',
    minQuarter: 16,
    steps: 5,
    finds: ['stick', 'snail', 'chalk', 'treasure'],
  },
];

// Un objet qu'on réclame à ses parents (dès 4 ans). La réponse dépend des
// moyens de la famille : oui si `cost` est atteint, plus tard à `laterMargin`
// près, sinon non.
export type ChildWish = {
  id: string;
  name: string;
  object: string;
  // Moyens de la famille nécessaires, de 0 à 100.
  cost: number;
  minQuarter: number;
};

export const childWishes: readonly ChildWish[] = [
  { id: 'bike', name: 'Un vélo', object: 'bike', cost: 80, minQuarter: 16 },
  {
    id: 'logicGame',
    name: 'Un jeu de logique',
    object: 'logicGame',
    cost: 40,
    minQuarter: 16,
  },
  {
    id: 'costume',
    name: 'Un déguisement',
    object: 'costume',
    cost: 55,
    minQuarter: 16,
  },
];

// Un trait : un avantage et un inconvénient, jamais l'un sans l'autre. Il est
// transmis à l'Enfance, qui en tirera ses effets.
export type ChildTrait = {
  id: string;
  name: string;
  advantage: string;
  drawback: string;
};

export const childTraits: readonly ChildTrait[] = [
  {
    id: 'stubborn',
    name: 'Têtu',
    advantage: 'Résiste à la pression',
    drawback: 'Se fâche plus vite',
  },
  {
    id: 'tender',
    name: 'Tendre',
    advantage: 'Les liens montent plus vite',
    drawback: 'Supporte mal la solitude',
  },
  {
    id: 'daring',
    name: 'Téméraire',
    advantage: 'Progresse vite en Énergie',
    drawback: 'Plus de chutes',
  },
  {
    id: 'sly',
    name: 'Rusé',
    advantage: 'Sort des situations tendues',
    drawback: 'Perd la confiance si on le voit',
  },
  {
    id: 'artist',
    name: 'Artiste',
    advantage: 'Esprit créatif',
    drawback: 'Désordre, peu de patience',
  },
  {
    id: 'honest',
    name: 'Honnête',
    advantage: 'Gagne la confiance des adultes',
    drawback: 'Mal à l’aise avec le mensonge',
  },
  {
    id: 'resourceful',
    name: 'Débrouillard',
    advantage: 'Se débrouille avec presque rien',
    drawback: 'Se méfie des inconnus',
  },
  {
    id: 'protector',
    name: 'Protecteur',
    advantage: 'Veille sur les autres',
    drawback: 'Se charge de tout',
  },
];

// Une activité pousse un axe vers un pôle (`direction` : +1 ou −1). Elle vient
// d'un objet, ou se débloque quand un axe est assez marqué d'un côté.
export type ChildActivity = {
  id: string;
  name: string;
  axis: ChildAxisId;
  direction: 1 | -1;
  // Part ajoutée à l'axe à chaque fois, sans hasard.
  amount: number;
  source:
    | { type: 'object'; id: string }
    | { type: 'axis'; axis: ChildAxisId; direction: 1 | -1 }
    // Une personne dont le lien est assez fort : l'activité est tirée de ses
    // goûts (`relationActivities`), pas de cette liste.
    | { type: 'relation'; person: string };
};

const push = 2;
const habit = 3;

export const childActivities: readonly ChildActivity[] = [
  {
    id: 'cuddleTeddy',
    name: 'Câliner le nounours',
    axis: 'temperament',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'teddy' },
  },
  {
    id: 'teachTeddy',
    name: 'Apprendre à marcher au nounours',
    axis: 'energy',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'teddy' },
  },
  {
    id: 'makeNoise',
    name: 'Faire du bruit',
    axis: 'sociability',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'rattle' },
  },
  {
    id: 'sortCubes',
    name: 'Classer les cubes par couleur',
    axis: 'temperament',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'cubes' },
  },
  {
    id: 'stackCubes',
    name: 'Empiler les cubes',
    axis: 'mind',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'cubes' },
  },
  {
    id: 'lookAtBook',
    name: 'Regarder le livre, seul',
    axis: 'sociability',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'books' },
  },
  {
    id: 'countBites',
    name: 'Manger en comptant les bouchées',
    axis: 'temperament',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'spoon' },
  },
  {
    id: 'chaseBall',
    name: 'Courir après le ballon',
    axis: 'energy',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'ball' },
  },
  {
    id: 'tryEverything',
    name: 'Tout essayer dans la boîte à formes',
    axis: 'mind',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'shapeBox' },
  },
  {
    id: 'watchCat',
    name: 'Observer le chat sans bouger',
    axis: 'energy',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'cat' },
  },
  {
    id: 'lickJar',
    name: 'Lécher le pot de confiture',
    axis: 'mind',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'jamJar' },
  },
  {
    id: 'bangPots',
    name: 'Taper sur les casseroles',
    axis: 'sociability',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'pots' },
  },
  {
    id: 'pressButtons',
    name: 'Appuyer sur tous les boutons',
    axis: 'mind',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'remote' },
  },
  {
    id: 'wearShoes',
    name: 'Marcher dans les chaussures de papa',
    axis: 'energy',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'shoes' },
  },
  {
    id: 'swingStick',
    name: 'Brandir le bâton',
    axis: 'energy',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'stick' },
  },
  {
    id: 'watchSnail',
    name: 'Regarder l’escargot avancer',
    axis: 'energy',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'snail' },
  },
  {
    id: 'drawChalk',
    name: 'Dessiner à la craie',
    axis: 'mind',
    direction: -1,
    amount: push,
    source: { type: 'object', id: 'chalk' },
  },
  {
    id: 'showTreasure',
    name: 'Montrer son trésor',
    axis: 'sociability',
    direction: 1,
    amount: push,
    source: { type: 'object', id: 'treasure' },
  },
  {
    id: 'rideBike',
    name: 'Faire du vélo',
    axis: 'energy',
    direction: 1,
    amount: habit,
    source: { type: 'object', id: 'bike' },
  },
  {
    id: 'solveLogic',
    name: 'Résoudre le jeu de logique',
    axis: 'mind',
    direction: -1,
    amount: habit,
    source: { type: 'object', id: 'logicGame' },
  },
  {
    id: 'playCostume',
    name: 'Jouer à se déguiser',
    axis: 'sociability',
    direction: 1,
    amount: habit,
    source: { type: 'object', id: 'costume' },
  },
  // Savoir-faire qui naissent d'un caractère déjà marqué.
  {
    id: 'climb',
    name: 'Grimper partout',
    axis: 'energy',
    direction: 1,
    amount: habit,
    source: { type: 'axis', axis: 'energy', direction: 1 },
  },
  {
    id: 'sitStill',
    name: 'Regarder longtemps',
    axis: 'energy',
    direction: -1,
    amount: habit,
    source: { type: 'axis', axis: 'energy', direction: -1 },
  },
  {
    id: 'chatter',
    name: 'Babiller avec les adultes',
    axis: 'sociability',
    direction: 1,
    amount: habit,
    source: { type: 'axis', axis: 'sociability', direction: 1 },
  },
  {
    id: 'tellStories',
    name: 'Se raconter des histoires',
    axis: 'sociability',
    direction: -1,
    amount: habit,
    source: { type: 'axis', axis: 'sociability', direction: -1 },
  },
  {
    id: 'takeApart',
    name: 'Tout démonter',
    axis: 'mind',
    direction: 1,
    amount: habit,
    source: { type: 'axis', axis: 'mind', direction: 1 },
  },
  {
    id: 'finishPuzzle',
    name: 'Finir un puzzle',
    axis: 'mind',
    direction: -1,
    amount: habit,
    source: { type: 'axis', axis: 'mind', direction: -1 },
  },
  {
    id: 'console',
    name: 'Consoler quelqu’un',
    axis: 'temperament',
    direction: 1,
    amount: habit,
    source: { type: 'axis', axis: 'temperament', direction: 1 },
  },
  {
    id: 'askWhy',
    name: 'Demander « pourquoi ? » à tout',
    axis: 'temperament',
    direction: -1,
    amount: habit,
    source: { type: 'axis', axis: 'temperament', direction: -1 },
  },
];
