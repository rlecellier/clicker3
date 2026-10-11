import { actionRules, upgrades } from '@game/data';
import { lifePhases } from '@game/state';
import type { GameState, LifePhase } from '@game/state';
import { ageOf } from '@game/time';

// Phase de progression d'après l'état : Entrepreneur à la première entreprise,
// Patron au premier employé. On ne redescend jamais.
export const phaseOf = (state: GameState): LifePhase => {
  const hasEmployee = upgrades.some(
    (upgrade) =>
      state.upgrades.includes(upgrade.id) &&
      upgrade.effects.some((effect) => effect.type === 'employee'),
  );
  const hasCompany = Object.values(state.companies).some((count) => count > 0);
  let reached: LifePhase = 'youngAdult';
  if (hasEmployee) {
    reached = 'boss';
  } else if (hasCompany) {
    reached = 'entrepreneur';
  }
  return lifePhases.indexOf(reached) > lifePhases.indexOf(state.phase)
    ? reached
    : state.phase;
};

export const updatePhase = (state: GameState): GameState => {
  const phase = phaseOf(state);
  return phase === state.phase ? state : { ...state, phase };
};

// La vieillesse se déduit de l'âge et se cumule avec la phase atteinte.
export const isSenior = (state: GameState) =>
  ageOf(state) >= state.life.seniorAge;

// Coefficient des gains d'une action manuelle.
export const manualFactor = (state: GameState) =>
  isSenior(state) ? actionRules.senior.manualFactor : 1;
