import type { ChildAxisId } from '@game/state';

// Condition d'éligibilité d'un événement de la petite enfance, toutes vraies.
// Un type de condition de plus s'ajoute ici (le contexte de départ, le lien
// avec une personne) sans toucher au moteur du tirage.
export type ChildCondition =
  // Âge en trimestres.
  | { type: 'age'; min?: number; max?: number }
  // Axe marqué d'au moins `atLeast` du côté `direction`.
  | { type: 'axis'; axis: ChildAxisId; direction: 1 | -1; atLeast: number }
  | { type: 'trait'; id: string }
  // Événement déjà vécu.
  | { type: 'event'; id: string }
  // Objet possédé.
  | { type: 'object'; id: string }
  // Lien d'au moins `atLeast` avec une personne (un parent, un ami).
  | { type: 'bond'; person: string; atLeast: number }
  // Étiquette de contexte de la situation de naissance (hôtel, plage…).
  | { type: 'context'; tag: string };

export type ChildEffect =
  // `amount` est signé : positif vers le pôle positif de l'axe.
  | { type: 'axis'; axis: ChildAxisId; amount: number }
  | { type: 'trait'; id: string }
  | { type: 'giveObject'; id: string }
  | { type: 'removeObject'; id: string }
  // Le lien avec une personne monte ou descend.
  | { type: 'bond'; person: string; amount: number }
  // Un premier ami entre dans la vie de l'enfant.
  | { type: 'meetFriend'; name: string; bond: number };

export type ChildEventChoice = {
  label: string;
  effects: readonly ChildEffect[];
};

export type ChildEvent = {
  id: string;
  title: string;
  text: string;
  conditions: readonly ChildCondition[];
  // Chance relative d'être tiré parmi les événements éligibles.
  weight: number;
  // Se produit dès que ses conditions sont remplies, avant tout tirage.
  isMandatory?: boolean;
  // Le même événement raconté autrement selon le contexte de départ (le texte
  // de la première variante dont l'étiquette est présente remplace `text`).
  variants?: readonly { context: string; text: string }[];
  choices: readonly ChildEventChoice[];
};

const age = (min: number, max?: number): ChildCondition => ({
  type: 'age',
  min,
  max,
});
// Un axe marqué d'au moins 25 d'un côté (le seuil des savoir-faire).
const axis = (id: ChildAxisId, direction: 1 | -1): ChildCondition => ({
  type: 'axis',
  axis: id,
  direction,
  atLeast: 25,
});
const push = (id: ChildAxisId, amount: number): ChildEffect => ({
  type: 'axis',
  axis: id,
  amount,
});
const context = (tag: string): ChildCondition => ({ type: 'context', tag });
const trait = (id: string): ChildEffect => ({ type: 'trait', id });
const bond = (person: string, amount: number): ChildEffect => ({
  type: 'bond',
  person,
  amount,
});

// Les âges sont des trimestres : 4 = 1 an. Voix administrative, comme le reste
// du jeu (docs/game/ton-et-univers.md).
export const childEvents: readonly ChildEvent[] = [
  {
    id: 'firstWord',
    title: 'Premier mot',
    text: 'Votre enfant a prononcé son premier mot. Le service prend acte et attend de savoir lequel.',
    conditions: [age(4)],
    weight: 1,
    isMandatory: true,
    choices: [
      { label: '« Maman »', effects: [push('bond', 6), bond('mother', 8)] },
      {
        label: '« Papa »',
        effects: [push('bond', 4), push('sociability', 2), bond('father', 8)],
      },
      { label: '« Non »', effects: [trait('stubborn'), push('mind', 3)] },
    ],
  },
  {
    id: 'stairs',
    title: 'L’escalier du salon',
    text: 'Un escalier est apparu dans la vie de votre enfant. Il n’a pas été consulté.',
    conditions: [age(5), axis('energy', 1)],
    weight: 2,
    choices: [
      { label: 'Grimper', effects: [push('energy', 6), trait('daring')] },
      {
        label: 'Appeler à l’aide',
        effects: [push('sociability', 4), push('bond', 2), bond('father', 3)],
      },
      {
        label: 'S’asseoir sur la première marche',
        effects: [push('energy', -4), push('mind', -3)],
      },
    ],
  },
  {
    id: 'puzzle',
    title: 'Le puzzle de 24 pièces',
    text: 'Un puzzle de 24 pièces a été remis à votre enfant. Il en manque une. Elle est probablement sous le canapé.',
    conditions: [age(6), axis('mind', -1)],
    weight: 2,
    choices: [
      { label: 'Finir seul', effects: [push('mind', -6)] },
      {
        label: 'Demander de l’aide',
        effects: [push('bond', 4), push('sociability', 3), bond('father', 4)],
      },
      { label: 'Tout renverser', effects: [push('mind', 5), trait('artist')] },
    ],
  },
  {
    id: 'cat',
    title: 'Un chat s’invite',
    text: 'Un chat est entré dans le foyer sans formulaire. Il s’est installé sur le meilleur coussin.',
    conditions: [age(6)],
    weight: 1,
    choices: [
      {
        label: 'L’adopter',
        effects: [{ type: 'giveObject', id: 'cat' }, push('bond', 3)],
      },
      { label: 'Lui courir après', effects: [push('energy', 4)] },
      { label: 'L’observer de loin', effects: [push('energy', -3)] },
    ],
  },
  {
    id: 'lostTeddy',
    title: 'Le nounours perdu',
    text: 'Le nounours est introuvable. L’enquête est confiée à la personne la plus petite de la maison.',
    conditions: [age(7), { type: 'object', id: 'teddy' }, axis('bond', 1)],
    weight: 2,
    choices: [
      {
        label: 'Le chercher partout',
        effects: [push('bond', 5), push('energy', 2)],
      },
      {
        label: 'Appeler un parent',
        effects: [push('bond', 6), push('sociability', 2), bond('mother', 4)],
      },
      {
        label: 'S’en passer',
        effects: [push('bond', -6), { type: 'removeObject', id: 'teddy' }],
      },
    ],
  },
  {
    id: 'supermarket',
    title: 'La crise au supermarché',
    text: 'Au rayon des céréales, un désaccord de portée nationale éclate. Il porte sur un paquet à l’effigie d’un lapin.',
    conditions: [age(8, 11)],
    variants: [
      {
        context: 'flat',
        text: 'À la caisse du discount, un désaccord éclate. Il porte sur un paquet de biscuits à l’effigie d’un lapin, dont le prix est calculé au centime près.',
      },
      {
        context: 'estate',
        text: 'Au restaurant de l’entreprise, un désaccord de portée nationale éclate. Il porte sur la couleur du verre à dents, et la nounou prend des notes.',
      },
    ],
    weight: 2,
    choices: [
      {
        label: 'Hurler',
        effects: [
          trait('stubborn'),
          push('energy', 3),
          push('bond', -3),
          bond('mother', -4),
        ],
      },
      {
        label: 'Obéir',
        effects: [push('bond', 2), push('mind', -3), bond('mother', 2)],
      },
      {
        label: 'Négocier',
        effects: [push('sociability', 4), trait('sly'), bond('mother', 1)],
      },
    ],
  },
  {
    id: 'meOnly',
    title: '« Moi tout seul ! »',
    text: 'Votre enfant a déclaré qu’il ferait seul. Aucun élément ne permet de dire qu’il en est capable.',
    conditions: [age(8), axis('bond', -1)],
    weight: 2,
    choices: [
      { label: 'Refuser toute aide', effects: [push('bond', -6)] },
      {
        label: 'Accepter un coup de main',
        effects: [push('bond', 3), bond('mother', 3)],
      },
      { label: 'Bouder', effects: [push('mind', -2), push('bond', -3)] },
    ],
  },
  {
    id: 'loudKid',
    title: 'Le camarade bruyant',
    text: 'Un camarade fait du bruit à proximité. Il semble en avoir beaucoup.',
    conditions: [age(10), axis('sociability', 1)],
    weight: 2,
    choices: [
      { label: 'Le rejoindre', effects: [push('sociability', 6)] },
      { label: 'L’imiter', effects: [push('mind', 4), push('sociability', 2)] },
      { label: 'L’éviter', effects: [push('sociability', -5)] },
    ],
  },
  {
    id: 'corner',
    title: 'Le coin du jardin',
    text: 'Un coin du jardin est resté sans affectation. Votre enfant l’a remarqué avant le propriétaire.',
    conditions: [age(10), axis('sociability', -1)],
    weight: 2,
    choices: [
      { label: 'Y rester', effects: [push('sociability', -6)] },
      { label: 'En parler', effects: [push('sociability', 4)] },
      {
        label: 'Y inviter quelqu’un',
        effects: [push('sociability', 3), push('bond', 3)],
      },
    ],
  },
  {
    id: 'jam',
    title: 'Pot de confiture',
    text: 'Un pot de confiture a été vidé de façon inexpliquée. Votre enfant a de la confiture jusqu’aux coudes.',
    conditions: [age(12)],
    variants: [
      {
        context: 'flat',
        text: 'Le dernier pot de confiture a été vidé de façon inexpliquée. Il devait durer jusqu’à la fin du mois.',
      },
      {
        context: 'estate',
        text: 'Un pot de caviar a été vidé de façon inexpliquée. Le service a pris acte.',
      },
    ],
    weight: 2,
    choices: [
      { label: 'Avouer', effects: [trait('honest'), bond('father', 3)] },
      { label: 'S’enfuir', effects: [push('energy', 4), trait('sly')] },
      { label: 'Partager', effects: [push('sociability', 3), push('bond', 3)] },
    ],
  },
  {
    id: 'sibling',
    title: 'Un petit frère, une petite sœur',
    text: 'La famille compte une personne de plus, de moins de cinquante centimètres. Elle n’a rien demandé non plus.',
    conditions: [age(14), context('onlyChild')],
    weight: 2,
    choices: [
      {
        label: 'Jalouser',
        effects: [trait('stubborn'), push('bond', -4), bond('mother', -3)],
      },
      {
        label: 'Protéger',
        effects: [
          trait('protector'),
          push('bond', 4),
          bond('mother', 3),
          bond('father', 3),
        ],
      },
      { label: 'Ignorer', effects: [push('mind', 3), push('sociability', -3)] },
    ],
  },
  {
    id: 'wall',
    title: 'Le dessin sur le mur',
    text: 'Une fresque est apparue dans le couloir, à hauteur d’enfant. Elle n’est pas signée.',
    conditions: [age(16)],
    variants: [
      {
        context: 'flat',
        text: 'Une fresque est apparue sur le mur du salon, à hauteur d’enfant. Le propriétaire n’a pas autorisé les travaux.',
      },
      {
        context: 'estate',
        text: 'Une fresque est apparue dans le hall de l’entreprise, à hauteur d’enfant. Elle a été prise pour une œuvre commandée et encadrée.',
      },
    ],
    weight: 2,
    choices: [
      {
        label: 'Avouer',
        effects: [trait('honest'), push('bond', 3), bond('mother', 4)],
      },
      {
        label: 'Accuser le chat',
        effects: [trait('sly'), push('sociability', -2), bond('mother', -3)],
      },
      {
        label: 'Recommencer plus grand',
        effects: [trait('artist'), push('mind', 4)],
      },
    ],
  },
  {
    id: 'firstFriend',
    title: 'Le premier copain',
    text: 'Un enfant de la même taille a été repéré à proximité. Il tient un jouet. Votre enfant aussi.',
    conditions: [age(12)],
    weight: 1,
    isMandatory: true,
    choices: [
      {
        label: 'Partager le jouet',
        effects: [
          { type: 'meetFriend', name: 'Noa', bond: 40 },
          push('sociability', 4),
        ],
      },
      {
        label: 'Le garder',
        effects: [
          { type: 'meetFriend', name: 'Noa', bond: 20 },
          push('mind', 3),
        ],
      },
      {
        label: 'Le casser',
        effects: [
          { type: 'meetFriend', name: 'Noa', bond: 5 },
          push('energy', 3),
        ],
      },
    ],
  },
  {
    id: 'bedtimeStory',
    title: 'L’histoire du soir',
    text: 'Une histoire est lue chaque soir par la même personne. La fin n’a pas varié depuis le onzième exemplaire.',
    conditions: [age(8), { type: 'bond', person: 'mother', atLeast: 50 }],
    weight: 3,
    choices: [
      {
        label: 'L’écouter jusqu’au bout',
        effects: [bond('mother', 4), push('mind', -3)],
      },
      {
        label: 'En réclamer une autre',
        effects: [bond('mother', 2), push('sociability', 3)],
      },
      {
        label: 'Faire semblant de dormir',
        effects: [bond('mother', -2), push('mind', 3)],
      },
    ],
  },
  {
    id: 'shoulders',
    title: 'Sur les épaules',
    text: 'Une proposition a été formulée en hauteur : monter sur les épaules d’un adulte. Aucune assurance n’est jointe.',
    conditions: [age(10), { type: 'bond', person: 'father', atLeast: 50 }],
    weight: 3,
    choices: [
      {
        label: 'Monter',
        effects: [bond('father', 4), push('energy', 4)],
      },
      {
        label: 'Rester au sol',
        effects: [bond('father', -2), push('energy', -3)],
      },
      {
        label: 'Demander à descendre',
        effects: [bond('father', 1), push('bond', 2)],
      },
    ],
  },
  {
    id: 'flatEvening',
    title: 'Le soir à l’appartement',
    text: 'L’appartement mesure quarante mètres carrés. Le salon, la chambre et la cuisine se partagent le même souffle.',
    conditions: [age(6), context('flat')],
    weight: 4,
    choices: [
      {
        label: 'Aider à mettre la table',
        effects: [push('mind', -4), bond('mother', 4)],
      },
      {
        label: 'Se glisser dans le lit de Maman',
        effects: [push('bond', 5), bond('mother', 5)],
      },
      {
        label: 'Jouer sous la table',
        effects: [push('mind', 4), push('sociability', -3)],
      },
    ],
  },
  {
    id: 'houseGarden',
    title: 'Le jardin du pavillon',
    text: 'Le jardin mesure trois cents mètres carrés, dont une pelouse, un portique et un grand frère ou une grande sœur qui a des idées.',
    conditions: [age(6), context('house')],
    weight: 4,
    choices: [
      { label: 'Courir derrière la fratrie', effects: [push('energy', 5)] },
      {
        label: 'Construire une cabane ensemble',
        effects: [push('sociability', 4), push('mind', -2)],
      },
      {
        label: 'Rester dans la maison',
        effects: [push('sociability', -4), bond('mother', 2)],
      },
    ],
  },
  {
    id: 'estateHall',
    title: 'Le hall du siège',
    text: 'Le hall du siège mesure quatre-vingts mètres de marbre. Une assistante vous attend à l’autre bout, avec un rendez-vous dans le calendrier de vos parents.',
    conditions: [age(6), context('estate')],
    weight: 4,
    choices: [
      { label: 'Courir', effects: [push('energy', 5), trait('daring')] },
      {
        label: 'Se cacher derrière la plante',
        effects: [push('sociability', -4)],
      },
      {
        label: 'Saluer l’assistante',
        effects: [push('sociability', 5), push('mind', 2)],
      },
    ],
  },
];
