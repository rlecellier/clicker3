import { childRules } from '@game/data';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

// La petite enfance est la tranche de départ de la partie.
export const isEarlyChildhood = (state: GameState) =>
  state.lifeSlice === 'earlyChildhood';

// Les 6 ans sont passés : la tranche est finie, plus aucune action ne joue.
export const isChildhoodOver = (state: GameState) =>
  state.child.quarter >= childRules.quarters;

// Un événement qui attend un choix arrête le jeu, comme une promotion.
export const hasPendingEvent = (state: GameState) =>
  state.child.pendingEvent !== null;

export const canAct = (state: GameState) =>
  isEarlyChildhood(state) &&
  isPlaying(state) &&
  !isChildhoodOver(state) &&
  !hasPendingEvent(state);
