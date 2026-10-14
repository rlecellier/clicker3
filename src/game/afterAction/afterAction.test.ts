import { afterAction } from './afterAction';
import { newGame } from '@game/reducer';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';

const start = (overrides: Partial<GameState> = {}): GameState =>
  deepFreeze({ ...newGame(), ...overrides });

describe('afterAction', () => {
  it('rend le même état quand rien ne change', () => {
    const state = start();
    expect(afterAction(state)).toBe(state);
  });

  it('ne vide pas le cerveau : la nuit vient avec la fin de période', () => {
    const state = start({
      markers: ['metier', 'metier', 'metier', 'metier', 'metier'],
    });
    expect(afterAction(state).markers).toHaveLength(5);
  });

  it('fait suivre la phase de vie aux achats', () => {
    const state = start({ companies: { atelier: 1 } });
    expect(afterAction(state).phase).toBe('entrepreneur');
  });

  it('évalue les événements après la phase', () => {
    const state = start({ companies: { atelier: 1 } });
    const after = afterAction(state);
    expect(after.mailReceived).toBeGreaterThan(state.mailReceived);
  });
});
