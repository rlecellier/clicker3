import { gameTabs, tabShortcut } from '@hook/useGameTabs';
import type { GameTabId } from '@hook/useGameTabs';

export type ShortcutAction =
  { type: 'openTab'; tab: GameTabId } | { type: 'work' } | { type: 'study' };

// Touches de travail et d'étude (affichées par `aria-keyshortcuts`).
export const WORK_SHORTCUT = 't';
export const STUDY_SHORTCUT = 'e';

// Table des raccourcis : touche (en minuscule) vers action. `1` à `8` suivent
// l'ordre de la sidebar (ADR 0008). Pas d'Espace ni d'Entrée (ils activent déjà
// le bouton qui a le focus), ni d'achat, de vente ni de « Recommencer ».
export const shortcutTable: Readonly<Record<string, ShortcutAction>> = {
  ...Object.fromEntries(
    gameTabs.flatMap((tab, index): [string, ShortcutAction][] => {
      const key = tabShortcut(index);
      return key === undefined ? [] : [[key, { type: 'openTab', tab: tab.id }]];
    }),
  ),
  [WORK_SHORTCUT]: { type: 'work' },
  [STUDY_SHORTCUT]: { type: 'study' },
};

type ShortcutEvent = Pick<
  KeyboardEvent,
  'key' | 'repeat' | 'ctrlKey' | 'altKey' | 'metaKey' | 'target'
>;

const editableTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (editableTags.has(target.tagName) || target.isContentEditable);

// Un menu ouvert (choix du cursus) ou une confirmation garde ses touches.
const isOverlayOpen = () =>
  document.querySelector('[role="menu"], [role="alertdialog"]') !== null;

// Action d'une touche, ou `undefined` quand le raccourci est ignoré : champ de
// saisie, menu ou confirmation ouverts, touche de modification, répétition.
export const shortcutFor = (
  event: ShortcutEvent,
): ShortcutAction | undefined => {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) {
    return undefined;
  }
  return isEditable(event.target) || isOverlayOpen()
    ? undefined
    : shortcutTable[event.key.toLowerCase()];
};
