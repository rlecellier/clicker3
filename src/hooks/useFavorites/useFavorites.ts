import { useCallback, useState } from 'react';

// Nombre d'activités favorites affichées sur l'écran Vie : une contrainte de
// lisibilité sur téléphone, pas une règle du jeu (les règles ne la connaissent
// pas, et elle ne dépend ni de l'âge ni de la situation).
export const MAX_FAVORITES = 4;

const STORAGE_KEY = 'clicker3.favorites';

const isIdList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((id) => typeof id === 'string');

// Les favoris sont une préférence d'affichage, gardée dans le navigateur ;
// l'absence ou l'échec du stockage les laisse simplement vides.
const read = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    );
    return isIdList(parsed) ? parsed.slice(0, MAX_FAVORITES) : [];
  } catch {
    return [];
  }
};

const write = (ids: readonly string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Sans stockage, les favoris durent le temps de la page.
  }
};

// Ajoute ou retire un favori ; un cinquième est refusé tant qu'un autre n'a pas été retiré.
export const toggleFavorite = (
  ids: readonly string[],
  id: string,
): readonly string[] => {
  if (ids.includes(id)) {
    return ids.filter((favorite) => favorite !== id);
  }
  return ids.length >= MAX_FAVORITES ? ids : [...ids, id];
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<readonly string[]>(read);
  const toggle = useCallback((id: string) => {
    setFavorites((current) => {
      const next = toggleFavorite(current, id);
      write(next);
      return next;
    });
  }, []);
  return { favorites, toggle, isFull: favorites.length >= MAX_FAVORITES };
};
