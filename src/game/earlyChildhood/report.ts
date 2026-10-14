import { startState } from '@game/data';
import { isPlaying } from '@game/state';
import type { ChildCarry, GameState } from '@game/state';
import { isChildhoodOver, isEarlyChildhood } from './status';

// Ce que la petite enfance laisse, lu à la fin de la tranche.
export const childCarry = (state: GameState): ChildCarry => ({
  axes: { ...state.child.axes },
  traits: [...state.child.traits],
  objects: [...state.child.objects],
  events: state.child.firedEvents.length,
});

// Le bilan n'est lisible qu'à la fin de la tranche, partie en cours.
export const canEnterChildhood = (state: GameState) =>
  isEarlyChildhood(state) && isPlaying(state) && isChildhoodOver(state);

// Entre en Enfance : l'état repart d'une tranche neuve, avec la situation de
// naissance, les relations et ce que la petite enfance a transmis.
export const enterChildhood = (state: GameState): GameState =>
  canEnterChildhood(state)
    ? {
        ...startState,
        lifeSlice: 'childhood',
        birthSituation: state.birthSituation,
        relations: state.relations,
        child: { ...startState.child, seed: state.child.seed },
        carry: childCarry(state),
      }
    : state;
