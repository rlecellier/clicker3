import { reputationTierOf } from '@game/reputation';
import { lifePhases } from '@game/state';
import type { GameState, LifePhase, StatId } from '@game/state';
import { tierOf } from '@game/stats';
import { ageOf } from '@game/time';

export type Requirement =
  | { type: 'stat'; stat: StatId; tier: number }
  | { type: 'reputation'; min: number }
  // Palier de réputation, d'après le total gagné.
  | { type: 'reputationTier'; tier: number }
  | { type: 'district'; id: string }
  // Phase atteinte ou dépassée.
  | { type: 'phase'; phase: LifePhase }
  | { type: 'age'; min: number }
  | { type: 'company'; id: string; count?: number }
  | { type: 'upgrade'; id: string }
  | { type: 'all'; of: Requirement[] }
  | { type: 'any'; of: Requirement[] };

export const isUnlocked = (
  state: GameState,
  requirement: Requirement,
): boolean => {
  switch (requirement.type) {
    case 'stat': {
      return tierOf(state, requirement.stat) >= requirement.tier;
    }
    case 'reputation': {
      return state.reputation >= requirement.min;
    }
    case 'reputationTier': {
      return reputationTierOf(state) >= requirement.tier;
    }
    case 'district': {
      return state.districts.includes(requirement.id);
    }
    case 'phase': {
      return (
        lifePhases.indexOf(state.phase) >= lifePhases.indexOf(requirement.phase)
      );
    }
    case 'age': {
      return ageOf(state) >= requirement.min;
    }
    case 'company': {
      return (state.companies[requirement.id] ?? 0) >= (requirement.count ?? 1);
    }
    case 'upgrade': {
      return state.upgrades.includes(requirement.id);
    }
    case 'all': {
      return requirement.of.every((part) => isUnlocked(state, part));
    }
    case 'any': {
      return requirement.of.some((part) => isUnlocked(state, part));
    }
  }
};
