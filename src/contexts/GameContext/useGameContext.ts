import { useContext } from 'react';
import { GameContext } from './GameContext';
import type { GameContextValue } from './types';

export const useGameContext = (): GameContextValue => {
  const value = useContext(GameContext);
  if (value === null) {
    throw new Error('useGameContext doit être utilisé dans un GameProvider');
  }
  return value;
};
