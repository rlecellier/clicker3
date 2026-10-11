import type { SaveStorage } from '@game/save';

export const SAVE_KEY = 'clicker3.save';

// `localStorage` peut manquer ou lever (navigation privée, quota) : le jeu
// continue alors sans sauvegarde.
export const createLocalStorage = (key = SAVE_KEY): SaveStorage => ({
  read: () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write: (text) => {
    try {
      localStorage.setItem(key, text);
    } catch {
      // sauvegarde impossible : on ignore
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(key);
    } catch {
      // rien à effacer
    }
  },
});
