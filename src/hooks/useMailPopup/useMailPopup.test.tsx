import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { GameProvider, useGameContext } from '@context/GameContext';
import { newGame } from '@game/reducer';
import { createMemoryStorage, serialize } from '@game/save';
import type { GameState } from '@game/state';
import { useMailPopup } from './useMailPopup';
import { MAX_READING_MS } from './readingTime';

const baseState: GameState = {
  ...newGame(),
  events: [{ period: 0, id: 'a', text: 'Ancien' }],
  mailReceived: 1,
  mailRead: 0,
};

const setup = (path: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>
      <GameProvider
        storage={createMemoryStorage(serialize(baseState, 0))}
        now={() => 0}
      >
        {children}
      </GameProvider>
    </MemoryRouter>
  );
  return renderHook(() => ({ popup: useMailPopup(), game: useGameContext() }), {
    wrapper,
  });
};

// Fait arriver un message de plus dans le courrier (fin de période).
const receive = (result: ReturnType<typeof setup>['result']) => {
  const before = result.current.game.state.mailReceived;
  act(() => {
    result.current.game.dispatch({
      type: 'addGauge',
      amount: 250,
      kind: 'work',
    });
  });
  expect(result.current.game.state.mailReceived).toBeGreaterThan(before);
};

describe('useMailPopup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ne montre rien pour le courrier déjà là à l’ouverture', () => {
    expect(setup('/jeu/vie').result.current.popup).toBeNull();
  });

  it('montre un nouveau message sans le marquer comme lu', () => {
    const { result } = setup('/jeu/vie');
    receive(result);
    expect(result.current.popup?.text).toBe(
      result.current.game.state.events.at(-1)?.text,
    );
    expect(result.current.game.state.mailRead).toBe(0);
  });

  it('remplace le message précédent et compte les autres', () => {
    const { result } = setup('/jeu/vie');
    receive(result);
    receive(result);
    const { state } = result.current.game;
    expect(result.current.popup).toMatchObject({
      text: state.events.at(-1)?.text,
      otherCount: state.mailReceived - baseState.mailReceived - 1,
    });
    expect(result.current.popup?.otherCount).toBeGreaterThan(0);
  });

  it('se ferme à la demande', () => {
    const { result } = setup('/jeu/vie');
    receive(result);
    act(() => {
      result.current.popup?.onDismiss();
    });
    expect(result.current.popup).toBeNull();
  });

  it('se ferme seule après le délai de lecture', () => {
    const { result } = setup('/jeu/vie');
    receive(result);
    act(() => {
      vi.advanceTimersByTime(MAX_READING_MS);
    });
    expect(result.current.popup).toBeNull();
  });

  it('attend la fin du survol pour se fermer', () => {
    const { result } = setup('/jeu/vie');
    receive(result);
    act(() => {
      result.current.popup?.onPause();
    });
    act(() => {
      vi.advanceTimersByTime(MAX_READING_MS * 2);
    });
    expect(result.current.popup).not.toBeNull();
    act(() => {
      result.current.popup?.onResume();
    });
    act(() => {
      vi.advanceTimersByTime(MAX_READING_MS);
    });
    expect(result.current.popup).toBeNull();
  });

  it('ne s’affiche pas sur l’onglet Courrier', () => {
    const { result } = setup('/jeu/courrier');
    receive(result);
    expect(result.current.popup).toBeNull();
  });
});
