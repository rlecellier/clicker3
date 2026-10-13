import type { GameState } from '@game/state';

// La dernière amélioration : la plus chère de toutes (le test le vérifie).
export const FINAL_UPGRADE_ID = 'marketplace';

const FLAG = 'finalUpgradeSeen';

// La dernière amélioration est achetée et le joueur n'en a pas encore pris
// acte : la pop-up « jusqu'au bout » l'attend.
export const isFinalUpgradePending = (state: GameState) =>
  state.upgrades.includes(FINAL_UPGRADE_ID) && state.flags[FLAG] !== true;

export const acknowledgeFinalUpgrade = (state: GameState): GameState => ({
  ...state,
  flags: { ...state.flags, [FLAG]: true },
});
