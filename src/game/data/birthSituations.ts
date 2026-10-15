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

// `id` est un identifiant de code, neutre (le niveau de vie : `low`, `medium`,
// `high`). `name` et `description` sont le libellé que le joueur lit : ils
// peuvent changer sans toucher au code, aux sauvegardes ni aux tests.
export type BirthSituation = {
  id: string;
  name: string;
  description: string;
  parents: readonly Parent[];
  // Objets que l'enfant possède à la naissance (ids d'objets).
  objects: readonly string[];
  // Étiquettes de contexte (appartement, pavillon, siège social…) lues par les conditions
  // d'événement .
  contexts: readonly string[];
  // Écart de départ des axes (l'avantage et le malus de la situation).
  axes: Partial<Record<ChildAxisId, number>>;
  // Traits imposés à la naissance.
  traits: readonly string[];
};

// La situation d'une partie qui n'en a pas choisi : la référence.
export const defaultBirthSituationId = 'medium';

export const birthSituations: readonly BirthSituation[] = [
  {
    id: 'low',
    name: 'Pas de chance',
    description:
      'Un seul parent, un salaire au SMIC et un appartement où tout le monde s’entend. Peu de moyens, beaucoup de débrouille, et un parent très présent quand le travail le permet.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 55, affection: 80, means: 10 },
        passion: { axis: 'bond', direction: 1, text: 'aime les câlins' },
      },
    ],
    objects: ['teddy'],
    contexts: ['flat', 'onlyChild'],
    axes: { bond: 8, energy: -6 },
    traits: ['resourceful'],
  },
  {
    id: 'medium',
    name: 'Privilégié',
    description:
      'Deux parents, un frère ou une sœur, un pavillon et un peu plus que le SMIC. Rien ne manque, rien ne dépasse.',
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
    contexts: ['house', 'sibling'],
    axes: {},
    traits: [],
  },
  {
    id: 'high',
    name: 'Self-made',
    description:
      'Deux parents à la tête d’une entreprise ou d’un portefeuille d’actions, une nounou et une chambre pleine de jouets. Les parents sont souvent en réunion, et les liens se construisent à distance.',
    parents: [
      {
        id: 'mother',
        name: 'Maman',
        role: 'mère',
        qualities: { availability: 20, affection: 40, means: 100 },
        passion: {
          axis: 'mind',
          direction: 1,
          text: 'aime les tableaux de bord',
        },
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
    contexts: ['estate', 'nanny', 'onlyChild'],
    axes: { mind: 8 },
    traits: [],
  },
];
