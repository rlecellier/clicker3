/**
 * Élément d'une liste de données par son id (`undefined` s'il n'existe pas).
 * Seule façon de chercher par id : les `xxxById` des règles s'appuient dessus.
 */
export const findById = <Item extends { id: string }>(
  list: readonly Item[],
  id: string | null | undefined,
): Item | undefined => list.find((item) => item.id === id);
