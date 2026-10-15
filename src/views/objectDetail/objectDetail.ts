import {
  childActivities,
  childEvents,
  childObjects,
  findById,
} from '@game/data';

// Ce qu'un objet ouvre : les activités qu'il débloque et les événements qu'il
// rend possibles.
export const objectUnlocks = (objectId: string) => {
  const activities = childActivities
    .filter(({ source }) => source.type === 'object' && source.id === objectId)
    .map(({ name }) => name);
  const events = childEvents
    .filter(({ conditions }) =>
      conditions.some(
        (condition) => condition.type === 'object' && condition.id === objectId,
      ),
    )
    .map(({ title }) => title);
  return [
    ...(activities.length === 0
      ? []
      : [{ caption: 'Débloque', items: activities }]),
    ...(events.length === 0
      ? []
      : [{ caption: 'Peut mener à', items: events }]),
  ];
};

// Fiche d'un objet : son nom, sa description et ce qu'il débloque.
export const objectDetail = (objectId: string) => {
  const object = findById(childObjects, objectId);
  return object === undefined
    ? undefined
    : {
        icon: object.icon,
        name: object.name,
        description: object.description,
        unlocks: objectUnlocks(object.id),
      };
};
