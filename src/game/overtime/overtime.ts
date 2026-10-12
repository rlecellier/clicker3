import { actionRules } from '@game/data';
import type { GameState } from '@game/state';

const { overtime } = actionRules.work;

// Jauge de travail déjà faite dans la période en cours (les segments de la
// jauge ne couvrent que la période courante et son éventuel surplus).
export const workGaugeDone = (state: GameState) => {
  let done = 0;
  for (const segment of state.gaugeSegments) {
    if (segment.kind === 'work') {
      done += segment.amount;
    }
  }
  return done;
};

// Tranche d'heures supplémentaires où tombe la prochaine action de travail, ou
// undefined tant que les 8 h de la journée ne sont pas faites.
export const overtimeTier = (state: GameState) => {
  const done = workGaugeDone(state);
  return overtime.tiers.findLast((tier) => done >= tier.from);
};

// Majoration du salaire de la prochaine action (1 en heures normales).
export const overtimeWageFactor = (state: GameState) =>
  overtimeTier(state)?.wage ?? 1;

// Coefficient de jauge de la prochaine action (fatigue des heures sup.).
export const overtimeGaugeFactor = (state: GameState) =>
  overtimeTier(state) === undefined ? 1 : 1 + overtime.gaugeSurcharge;

// Vrai quand la prochaine action de travail est payée en heures sup.
export const isOvertime = (state: GameState) =>
  overtimeTier(state) !== undefined;
