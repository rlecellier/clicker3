import { formatAge, formatPeriodDate, formatPhase } from '@game/format';
import type { GameState } from '@game/state';
import { ageOf } from '@game/time';

// Nom, âge, date et phase de vie du personnage, partagés par Vie et Profil.
export const characterHeader = (state: GameState) => ({
  name: state.characterName,
  age: formatAge(ageOf(state)),
  date: formatPeriodDate(state),
  phase: formatPhase(state),
});
