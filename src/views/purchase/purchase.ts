import { checkRequirement, formatCount } from '@game/format';
import { isUnlocked } from '@game/requirements';
import type { Requirement } from '@game/requirements';
import { isPlaying } from '@game/state';
import type { GameState } from '@game/state';

// Raisons d'une action impossible, communes à tous les écrans.
export const ENDED = 'Partie terminée';
export const NO_MONEY = 'Argent insuffisant';
export const NO_REPUTATION = 'Réputation insuffisante';

// Les prérequis à afficher en vert ou en rouge, seulement s'il en manque.
export const missingConditions = (
  state: GameState,
  requirement: Requirement | undefined,
) =>
  requirement !== undefined && !isUnlocked(state, requirement)
    ? checkRequirement(state, requirement)
    : undefined;

type UnavailableOptions = {
  // L'achat est déjà fait (quartier ouvert, emploi actuel) : aucune raison.
  isDone?: boolean;
  requirement?: Requirement;
  // Ce qui manque quand tout est débloqué (argent, réputation…).
  shortage: string;
};

/**
 * Pourquoi un achat est impossible : rien si déjà fait, sinon la fin de
 * partie, rien quand un prérequis manque (les conditions le disent), et à
 * défaut la ressource qui manque. À n'afficher que sur un bouton désactivé.
 */
export const unavailableReason = (
  state: GameState,
  { isDone = false, requirement, shortage }: UnavailableOptions,
) => {
  if (isDone) {
    return;
  }
  if (!isPlaying(state)) {
    return ENDED;
  }
  return missingConditions(state, requirement) === undefined
    ? shortage
    : undefined;
};

// Repère du nombre d'exemplaires possédés, absent à zéro.
export const ownedBadge = (count: number) =>
  count > 0 ? `${formatCount(count)} possédé(s)` : undefined;
