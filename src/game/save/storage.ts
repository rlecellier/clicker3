import type { GameState } from '@game/state';
import { deserialize, serialize } from './save';
import type { LoadResult } from './save';

/**
 * Stockage de la sauvegarde, injectable : `localStorage` dans l'application
 * (V1-16), une fausse implémentation en mémoire dans les tests.
 */
export type SaveStorage = {
  read: () => string | null;
  write: (text: string) => void;
  clear: () => void;
};

export const createMemoryStorage = (
  initial: string | null = null,
): SaveStorage => {
  let content = initial;
  return {
    read: () => content,
    write: (text) => {
      content = text;
    },
    clear: () => {
      content = null;
    },
  };
};

export const saveGame = (
  storage: SaveStorage,
  state: GameState,
  now: number,
) => {
  storage.write(serialize(state, now));
};

// Rien de sauvegardé : `null`, pas une erreur.
export const loadGame = (storage: SaveStorage): LoadResult | null => {
  const text = storage.read();
  return text === null ? null : deserialize(text);
};
