import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';
import { startState } from '@game/data';
import { serialize } from '@game/save';
import type { GameState } from '@game/state';

export const SAVE_KEY = 'clicker3.save';

type Preload = {
  // Écarts avec le début d'une vie (les règles du jeu ne changent pas).
  state?: Partial<GameState>;
  // Durée de l'absence simulée : `lastSeenAt` est reculé d'autant.
  absenceMs?: number;
};

/**
 * Précharge une sauvegarde dans `localStorage` avant le prochain chargement de
 * page. Le script ne joue qu'une fois par appel (drapeau en `sessionStorage`) :
 * sinon il écraserait la partie à chaque rechargement. La sauvegarde de sortie
 * (`beforeunload`) de la page quittée passe avant lui, elle n'écrase donc pas
 * la sauvegarde préchargée.
 */
export const preloadSave = async (
  page: Page,
  { state = {}, absenceMs = 0 }: Preload = {},
) => {
  const flag = `preload-${randomUUID()}`;
  const content = serialize(
    { ...startState, ...state },
    Date.now() - absenceMs,
  );
  await page.addInitScript(
    ({ key, flagName, text }) => {
      if (sessionStorage.getItem(flagName) !== null) {
        return;
      }
      sessionStorage.setItem(flagName, '1');
      localStorage.setItem(key, text);
    },
    { key: SAVE_KEY, flagName: flag, text: content },
  );
};
