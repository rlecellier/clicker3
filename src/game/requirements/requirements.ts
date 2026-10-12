import { reputationTierOf } from '@game/reputation';
import { lifePhases } from '@game/state';
import type { GameState, LifePhase, StatId } from '@game/state';
import { tierOf } from '@game/stats';
import { ageOf } from '@game/time';

export type StatementFlag = 'rentPaid' | 'unpaid' | 'stockout' | 'stockFull';

export type Requirement =
  | { type: 'stat'; stat: StatId; tier: number }
  | { type: 'reputation'; min: number }
  // Palier de réputation, d'après le total gagné.
  | { type: 'reputationTier'; tier: number }
  | { type: 'district'; id: string }
  // Phase atteinte ou dépassée.
  | { type: 'phase'; phase: LifePhase }
  | { type: 'age'; min: number }
  // Nombre de périodes écoulées (pour dater une arrivée, ex. internet).
  | { type: 'period'; min: number }
  | { type: 'company'; id: string; count?: number }
  | { type: 'upgrade'; id: string }
  | { type: 'dead' }
  // Drapeau du relevé de la période qui vient de se terminer.
  | { type: 'statement'; flag: StatementFlag }
  | { type: 'all'; of: Requirement[] }
  | { type: 'any'; of: Requirement[] };

const statementFlag = (state: GameState, flag: StatementFlag) => {
  const statement = state.lastStatement;
  // Seul le relevé de la période qui vient de se terminer compte.
  if (statement === null || statement.period !== state.period - 1) {
    return false;
  }
  switch (flag) {
    case 'rentPaid': {
      return statement.paidExpenses;
    }
    case 'unpaid': {
      return statement.unpaid;
    }
    case 'stockout': {
      return statement.stockout;
    }
    case 'stockFull': {
      return statement.stockFull;
    }
  }
};

// Condition facultative d'une donnée : remplie quand il n'y en a pas.
export const isRequirementMet = (
  state: GameState,
  requirement: Requirement | undefined,
) => requirement === undefined || isUnlocked(state, requirement);

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
    case 'period': {
      return state.period >= requirement.min;
    }
    case 'age': {
      return ageOf(state) >= requirement.min;
    }
    case 'company': {
      return (state.companies[requirement.id] ?? 0) >= (requirement.count ?? 1);
    }
    case 'dead': {
      return state.status === 'dead';
    }
    case 'statement': {
      return statementFlag(state, requirement.flag);
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
