import type { Dispatch, ReactNode } from 'react';
import type { AbsenceSummary } from '@game/automation';
import type { GameAction } from '@game/reducer';
import type { SaveStorage } from '@game/save';
import type { GameState } from '@game/state';

// Horloge injectable (ms) : les règles ne la lisent jamais, seul le provider.
export type GameClock = () => number;

export type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  // « Pendant votre absence », tant que le joueur ne l'a pas fermé.
  absence: AbsenceSummary | null;
  dismissAbsence: () => void;
  // Une partie est sauvegardée : sans elle, on reste à l'écran titre.
  hasSave: boolean;
  // Commence une vie neuve avec ce premier emploi et la sauvegarde.
  startGame: (jobId: string) => void;
  // Efface la sauvegarde et revient à une vie neuve non sauvegardée.
  eraseSave: () => void;
};

export type GameProviderOptions = {
  children: ReactNode;
  storage?: SaveStorage;
  now?: GameClock;
};

// Actions internes du provider, en plus de celles des règles.
export type ProviderAction = GameAction | { type: 'load'; state: GameState };
