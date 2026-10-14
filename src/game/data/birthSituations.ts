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
      },
      {
        id: 'father',
        name: 'Papa',
        role: 'père',
        qualities: { availability: 50, affection: 60, means: 50 },
      },
    ],
    objects: [],
    contexts: [],
  },
];
