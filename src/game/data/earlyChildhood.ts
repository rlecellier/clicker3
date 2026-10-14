import type { ChildAxisId, ChildPlaceId } from '@game/state';

// Règles de la petite enfance (docs/game/petite-enfance.md). Une période y est
// un trimestre : 24 trimestres font les 6 ans de la tranche.
export const childRules = {
  // Actions qui remplissent un trimestre (chaque action en vaut une).
  quarterCapacity: 10,
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
  { id: 'bond', name: 'Lien', positive: 'Câlin', negative: 'Indépendant' },
];

export type ChildObject = {
  id: string;
  name: string;
  // Éveil (nombre d'actions) auquel l'entourage le donne ; absent pour un objet
  // qu'on trouve en fouillant ou qu'on réclame.
  giftAt?: number;
};

// Les premiers objets, offerts à mesure que l'éveil monte. Les événements
// (issue suivante) en donneront d'autres.
export const childObjects: readonly ChildObject[] = [
  { id: 'teddy', name: 'Nounours', giftAt: 4 },
  { id: 'rattle', name: 'Hochet', giftAt: 10 },
  { id: 'cubes', name: 'Cubes', giftAt: 18 },
  { id: 'books', name: 'Livre d’images', giftAt: 28 },
  { id: 'spoon', name: 'Cuillère', giftAt: 38 },
  { id: 'ball', name: 'Ballon', giftAt: 50 },
  { id: 'shapeBox', name: 'Boîte à formes', giftAt: 64 },
  { id: 'cat', name: 'Le chat', giftAt: 80 },
  // Trouvailles de la maison.
  { id: 'jamJar', name: 'Pot de confiture' },
  { id: 'pots', name: 'Casseroles' },
  { id: 'remote', name: 'Télécommande' },
  { id: 'shoes', name: 'Chaussures de papa' },
  // Trouvailles du dehors.
  { id: 'stick', name: 'Bâton' },
  { id: 'snail', name: 'Escargot' },
  { id: 'chalk', name: 'Craies' },
  { id: 'treasure', name: 'Trésor de la cour' },
  // Objets réclamés aux parents.
  { id: 'bike', name: 'Vélo' },
  { id: 'logicGame', name: 'Jeu de logique' },
  { id: 'costume', name: 'Déguisement' },
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
    | { type: 'axis'; axis: ChildAxisId; direction: 1 | -1 };
};

const push = 2;
const habit = 3;

export const childActivities: readonly ChildActivity[] = [
  {
    id: 'cuddleTeddy',
    name: 'Câliner le nounours',
    axis: 'bond',
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
    id: 'eatAlone',
    name: 'Manger tout seul',
    axis: 'bond',
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
    axis: 'bond',
    direction: 1,
    amount: habit,
    source: { type: 'axis', axis: 'bond', direction: 1 },
  },
  {
    id: 'dressAlone',
    name: 'S’habiller seul',
    axis: 'bond',
    direction: -1,
    amount: habit,
    source: { type: 'axis', axis: 'bond', direction: -1 },
  },
];
