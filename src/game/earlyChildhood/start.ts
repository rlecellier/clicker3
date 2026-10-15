import { birthSituations, childRules, findById, startState } from '@game/data';
import type { ChildState } from '@game/state';

const clamp = (value: number) =>
  Math.max(-childRules.axisLimit, Math.min(childRules.axisLimit, value));

// L'enfant à la naissance : les axes de départ de la situation (son avantage
// et son malus), ses objets et ses traits imposés. Rien d'autre ne change.
export const newChild = (situationId: string, seed: number): ChildState => {
  const situation = findById(birthSituations, situationId);
  const base = startState.child;
  return {
    ...base,
    seed,
    axes: {
      energy: clamp(situation?.axes.energy ?? 0),
      sociability: clamp(situation?.axes.sociability ?? 0),
      mind: clamp(situation?.axes.mind ?? 0),
      temperament: clamp(situation?.axes.temperament ?? 0),
    },
    objects: [...(situation?.objects ?? [])],
    traits: [...(situation?.traits ?? [])],
  };
};
