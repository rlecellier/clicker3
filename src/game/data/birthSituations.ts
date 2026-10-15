import type { ChildAxisId } from '@game/state';

// Les qualités d'un parent, de 0 à 100 : elles règlent le rythme de l'Attention
// et la réponse à une demande (docs/game/petite-enfance.md).
export type ParentQualities = {
  // Temps que le parent a pour l'enfant.
  availability: number;
  // Chaleur du lien de départ.
  affection: number;
  // Ressources de la famille.
  means: number;
};

export type Parent = {
  id: string;
  name: string;
  // Place dans la famille (mère, père, grand-parent…).
  role: string;
  qualities: ParentQualities;
  // Ce que ce parent aime partager : un lien assez fort pousse l'axe de l'enfant
  // de ce côté, et ouvre une activité à faire avec lui.
  passion: { axis: ChildAxisId; direction: 1 | -1; text: string };
};

export type BirthSituation = {
  id: string;
  name: string;
  description: string;
  parents: readonly Parent[];
  // Objets que l'enfant possède à la naissance (ids d'objets).
  objects: readonly string[];
  // Étiquettes de contexte (hôtel, plage, tournée…) lues par les conditions
  // d'événement ; aucune pour la famille standard.
  contexts: readonly string[];
  // Écart de départ des axes (l'avantage et le malus de la situation).
  axes: Partial<Record<ChildAxisId, number>>;
  // Traits imposés à la naissance.
  traits: readonly string[];
};

// La situation d'une partie qui n'en a pas choisi : la référence, sans relief.
export const defaultBirthSituationId = 'standard';

export const birthSituations: readonly BirthSituation[] = [
  {
    id: defaultBirthSituationId,
    name: 'Famille standard',
    description:
      'Deux parents ordinaires, un logement correct, des journées bien remplies. Rien ne manque, rien ne dépasse.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 50, affection: 60, means: 50 },
        passion: { axis: 'sociability', direction: 1, text: 'aime bavarder' },
      },
      {
        id: 'father',
        name: 'Papa',
        role: 'père',
        qualities: { availability: 50, affection: 60, means: 50 },
        passion: { axis: 'energy', direction: 1, text: 'aime courir dehors' },
      },
    ],
    objects: [],
    contexts: [],
    axes: {},
    traits: [],
  },
  {
    id: 'millionaire',
    name: 'Fils ou fille de millionnaire',
    description:
      'Des moyens énormes, une chambre pleine de jouets, une nounou. Les parents sont souvent ailleurs, et les liens se construisent à distance.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 20, affection: 40, means: 100 },
        passion: { axis: 'mind', direction: 1, text: 'aime collectionner' },
      },
      {
        id: 'father',
        name: 'Papa',
        role: 'père',
        qualities: { availability: 10, affection: 30, means: 100 },
        passion: {
          axis: 'sociability',
          direction: 1,
          text: 'aime les réceptions',
        },
      },
    ],
    objects: ['teddy', 'cubes', 'ball', 'shapeBox'],
    contexts: ['hotel', 'nanny'],
    axes: { mind: 8 },
    traits: [],
  },
  {
    id: 'rockStar',
    name: 'Fils ou fille de star du rock',
    description:
      'Une vie de tournée, de balances et de bruit à toute heure. Aucune règle ne tient plus de deux jours, et personne ne s’en plaint.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 40, affection: 70, means: 55 },
        passion: { axis: 'sociability', direction: 1, text: 'aime chanter' },
      },
      {
        id: 'father',
        name: 'Papa',
        role: 'père',
        qualities: { availability: 25, affection: 50, means: 60 },
        passion: { axis: 'energy', direction: 1, text: 'aime la scène' },
      },
    ],
    objects: ['rattle', 'pots'],
    contexts: ['tour', 'stage'],
    axes: { sociability: 15, mind: 10 },
    traits: [],
  },
  {
    id: 'homeless',
    name: 'Sans domicile fixe',
    description:
      'Un parent très présent, un nounours, des déménagements. Peu de moyens, beaucoup de débrouille, et une santé qu’il faut surveiller.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 90, affection: 85, means: 5 },
        passion: { axis: 'temperament', direction: 1, text: 'aime les câlins' },
      },
    ],
    objects: ['teddy'],
    contexts: ['shelter', 'street'],
    axes: { mind: 12, energy: -10 },
    traits: ['resourceful'],
  },
  {
    id: 'teachers',
    name: 'Parents enseignants',
    description:
      'Des livres à toutes les hauteurs, des questions à chaque repas et un budget serré. On apprend vite, sous pression.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 60, affection: 60, means: 35 },
        passion: { axis: 'mind', direction: -1, text: 'aime lire' },
      },
      {
        id: 'father',
        name: 'Papa',
        role: 'père',
        qualities: { availability: 55, affection: 55, means: 35 },
        passion: { axis: 'sociability', direction: 1, text: 'aime expliquer' },
      },
    ],
    objects: ['books', 'cubes'],
    contexts: ['books'],
    axes: { mind: -12, sociability: 8 },
    traits: [],
  },
  {
    id: 'farm',
    name: 'Ferme familiale',
    description:
      'Le grand air, les animaux et les grands-parents toute l’année. Les journées sont longues, les jouets rares, les bottes toujours humides.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 35, affection: 65, means: 40 },
        passion: { axis: 'energy', direction: 1, text: 'aime le grand air' },
      },
      {
        id: 'father',
        name: 'Papa',
        role: 'père',
        qualities: { availability: 30, affection: 55, means: 45 },
        passion: { axis: 'energy', direction: 1, text: 'aime les bêtes' },
      },
    ],
    objects: ['stick', 'cat'],
    contexts: ['farm', 'animals'],
    axes: { energy: 14 },
    traits: [],
  },
];
