import { journalLimit } from '@game/data';
import type { GameState } from '@game/state';

// Messages arrivés depuis la dernière lecture du courrier. Les deux compteurs
// ne font que croître (le journal est tronqué, ses index ne sont pas stables) ;
// seuls les `journalLimit` plus récents sont encore consultables.
export const unreadMail = (state: GameState) =>
  Math.min(state.mailReceived - state.mailRead, journalLimit);

// Le joueur a lu le courrier : plus aucun message n'est non lu.
export const readMail = (state: GameState): GameState =>
  state.mailRead === state.mailReceived
    ? state
    : { ...state, mailRead: state.mailReceived };
