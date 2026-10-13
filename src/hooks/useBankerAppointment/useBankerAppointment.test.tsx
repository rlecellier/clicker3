import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider, useGameContext } from '@context/GameContext';
import { startState } from '@game/data';
import { isPlacementOpen } from '@game/placements';
import { createMemoryStorage, serialize } from '@game/save';
import { placementIds } from '@game/state';
import type { PlacementId } from '@game/state';
import { appointmentScript } from './script';
import { useBankerAppointment } from './useBankerAppointment';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider
    storage={createMemoryStorage(
      serialize({ ...startState, reputationEarned: 200 }, 0),
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

describe('useBankerAppointment', () => {
  it('n’affiche rien tant qu’aucun rendez-vous n’est pris', () => {
    const { result } = setup();
    expect(result.current.banker.dialog).toBeNull();
  });

  it('chaque compte a un rendez-vous de longueur différente', () => {
    const lengths = placementIds.map(
      (id) => appointmentScript(id).steps.length,
    );
    expect(new Set(lengths).size).toBe(placementIds.length);
  });

  it.each(placementIds)(
    'le rendez-vous du compte %s se termine par l’ouverture du compte',
    (id: PlacementId) => {
      const { result } = setup();
      const { steps, farewell } = appointmentScript(id);
      act(() => {
        result.current.banker.start(id);
      });
      for (let step = 0; step < steps.length; step++) {
        expect(result.current.banker.dialog?.title).toContain(
          `${step + 1}/${steps.length + 1}`,
        );
        act(() => {
          result.current.banker.dialog?.onReply(0);
        });
        expect(isPlacementOpen(result.current.game.state, id)).toBe(false);
      }
      expect(result.current.banker.dialog?.replies).toEqual([farewell]);
      act(() => {
        result.current.banker.dialog?.onReply(0);
      });
      expect(result.current.banker.dialog).toBeNull();
      expect(isPlacementOpen(result.current.game.state, id)).toBe(true);
    },
  );

  it('le banquier réagit à la réponse choisie', () => {
    const [first, second] = [0, 1].map((index) => {
      const { result } = setup();
      act(() => {
        result.current.banker.start('savings');
      });
      act(() => {
        result.current.banker.dialog?.onReply(index);
      });
      return result.current.banker.dialog?.message;
    });
    const { steps } = appointmentScript('savings');
    expect(first).toContain(steps[0]?.replies[0]?.reaction);
    expect(second).toContain(steps[0]?.replies[1]?.reaction);
    expect(first).not.toBe(second);
  });

  it('reporter le rendez-vous ferme le dialogue sans ouvrir le compte', () => {
    const { result } = setup();
    act(() => {
      result.current.banker.start('savings');
    });
    act(() => {
      result.current.banker.dialog?.onReply(0);
    });
    act(() => {
      result.current.banker.dialog?.onLeave();
    });
    expect(result.current.banker.dialog).toBeNull();
    expect(isPlacementOpen(result.current.game.state, 'savings')).toBe(false);
  });
});
