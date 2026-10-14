import type { ChildAxisId } from '@game/state';

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
  // Éveil (nombre d'actions) auquel l'entourage le donne.
  giftAt: number;
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
