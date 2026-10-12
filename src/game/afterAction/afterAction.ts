import { triggerEvents } from '@game/events';
import { updatePhase } from '@game/phases';
import { settleSleep } from '@game/sleep';
import type { GameState } from '@game/state';

/**
 * Ce qui suit toute action, manuelle ou automatique : un cerveau plein endort
 * (et un réveil rejoue les gestes gardés), la phase de vie suit les achats,
 * puis les événements sont évalués (ceux de fin de période l'ont déjà été dans
 * `endPeriod`). Seul point d'entrée : le reducer et la boucle automatique
 * l'appliquent tous les deux.
 */
export const afterAction = (state: GameState): GameState =>
  triggerEvents(updatePhase(settleSleep(state)));
