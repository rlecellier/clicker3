import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider } from '@context/GameContext';
import { createMemoryStorage } from '@game/save';
import { useGameActions } from '@hook/useGameActions';
import { useGameStatus } from './useGameStatus';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider storage={createMemoryStorage()} now={() => 0}>
    {children}
  </GameProvider>
);

describe('useGameStatus et useGameActions', () => {
  it('lit l’état et reflète les actions du joueur', () => {
    const { result } = renderHook(
      () => ({ status: useGameStatus(), actions: useGameActions() }),
      { wrapper },
    );
    const before = result.current.status;
    expect(before.status).toBe('playing');
    act(() => {
      result.current.actions.work('job');
    });
    expect(result.current.status.gauge).toBeGreaterThan(before.gauge);
  });
});
