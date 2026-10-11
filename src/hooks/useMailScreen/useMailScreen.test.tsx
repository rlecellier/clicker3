import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider, useGameContext } from '@context/GameContext';
import { newGame } from '@game/reducer';
import { createMemoryStorage, serialize } from '@game/save';
import type { GameState } from '@game/state';
import { useMailScreen } from './useMailScreen';

const setup = (state: GameState) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameProvider
      storage={createMemoryStorage(serialize(state, 0))}
      now={() => 0}
    >
      {children}
    </GameProvider>
  );
  return renderHook(() => ({ mail: useMailScreen(), game: useGameContext() }), {
    wrapper,
  });
};

const unreadState: GameState = {
  ...newGame(),
  events: [
    { period: 0, id: 'a', text: 'Ancien' },
    { period: 0, id: 'b', text: 'Récent' },
  ],
  mailReceived: 2,
  mailRead: 1,
};

describe('useMailScreen', () => {
  it('liste le plus récent en haut', () => {
    const { result } = setup(unreadState);
    expect(result.current.mail.entries.map((entry) => entry.text)).toEqual([
      'Récent',
      'Ancien',
    ]);
  });

  it('lit le courrier à l’ouverture et garde le non-lu en évidence', () => {
    const { result } = setup(unreadState);
    expect(result.current.game.state.mailRead).toBe(2);
    expect(result.current.mail.entries.map((entry) => entry.isNew)).toEqual([
      true,
      false,
    ]);
  });

  it('lit aussitôt un message reçu pendant que l’onglet est ouvert', () => {
    const { result } = setup({ ...unreadState, mailRead: 2 });
    expect(result.current.mail.entries.some((entry) => entry.isNew)).toBe(
      false,
    );
    act(() => {
      result.current.game.dispatch({ type: 'addGauge', amount: 250 });
    });
    expect(result.current.game.state.mailRead).toBe(
      result.current.game.state.mailReceived,
    );
  });
});
