import { useEffect } from 'react';
import type { GameTabId } from '@hook/useGameTabs';
import { shortcutFor } from './shortcuts';

export type ShortcutHandlers = {
  openTab: (tab: GameTabId) => void;
  work: () => void;
  study: () => void;
};

// Écoute le clavier tant que le composant est monté et appelle l'action de la
// touche pressée (voir `shortcuts.ts` pour la table et les cas ignorés).
export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = shortcutFor(event);
      if (action === undefined) {
        return;
      }
      event.preventDefault();
      if (action.type === 'openTab') {
        handlers.openTab(action.tab);
        return;
      }
      handlers[action.type]();
    };
    addEventListener('keydown', onKeyDown);
    return () => {
      removeEventListener('keydown', onKeyDown);
    };
  }, [handlers]);
};
