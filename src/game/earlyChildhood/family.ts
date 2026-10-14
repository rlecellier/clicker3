import { birthSituations, findById } from '@game/data';
import type { ParentQualities } from '@game/data';
import type { GameState } from '@game/state';

// Moyenne des qualités des parents de la situation de naissance.
export const familyQualities = (state: GameState): ParentQualities => {
  const parents =
    findById(birthSituations, state.birthSituation)?.parents ?? [];
  const average = (pick: (qualities: ParentQualities) => number) =>
    parents.length === 0
      ? 0
      : parents.reduce((sum, { qualities }) => sum + pick(qualities), 0) /
        parents.length;
  return {
    availability: average((qualities) => qualities.availability),
    affection: average((qualities) => qualities.affection),
    means: average((qualities) => qualities.means),
  };
};
