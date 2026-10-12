import type { GameState } from './types';

// La partie est en cours : toute action (achat, travail, étude…) l'exige.
export const isPlaying = (state: GameState) => state.status === 'playing';
