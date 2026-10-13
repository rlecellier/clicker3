import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider, useGameContext } from '@context/GameContext';
import { startState } from '@game/data';
import { isPlacementOpen } from '@game/placements';
import { createMemoryStorage, serialize } from '@game/save';
import { appointmentScript } from './script';
import { useBankerAppointment } from './useBankerAppointment';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider
    storage={createMemoryStorage(
      serialize({ ...startState, reputationEarned: 6 }, 0),
    )}
    now={() => 0}
  >
    {children}
  </GameProvider>
);

const setup = () =>
  renderHook(
    () => ({ banker: useBankerAppointment(), game: useGameContext() }),
    { wrapper },
  );

const stepCount = appointmentScript('Livret A').length;

describe('useBankerAppointment', () => {
  it('n’affiche rien tant qu’aucun rendez-vous n’est pris', () => {
    const { result } = setup();
    expect(result.current.banker.dialog).toBeNull();
  });

  it('chaque réponse avance le dialogue ; la dernière (« Merci ») ouvre le compte', () => {
    const { result } = setup();
    act(() => {
      result.current.banker.start('savings');
    });
    for (let step = 0; step < stepCount - 1; step++) {
      expect(result.current.banker.dialog?.title).toContain(
        `${step + 1}/${stepCount}`,
      );
      act(() => {
        result.current.banker.dialog?.onReply();
      });
      expect(isPlacementOpen(result.current.game.state, 'savings')).toBe(false);
    }
    expect(result.current.banker.dialog?.replies).toEqual(['Merci.']);
    act(() => {
      result.current.banker.dialog?.onReply();
    });
    expect(result.current.banker.dialog).toBeNull();
    expect(isPlacementOpen(result.current.game.state, 'savings')).toBe(true);
    expect(isPlacementOpen(result.current.game.state, 'ldds')).toBe(false);
  });

  it('reporter le rendez-vous ferme le dialogue sans ouvrir le compte', () => {
    const { result } = setup();
    act(() => {
      result.current.banker.start('savings');
    });
    act(() => {
      result.current.banker.dialog?.onReply();
    });
    act(() => {
      result.current.banker.dialog?.onLeave();
    });
    expect(result.current.banker.dialog).toBeNull();
    expect(isPlacementOpen(result.current.game.state, 'savings')).toBe(false);
  });
});
