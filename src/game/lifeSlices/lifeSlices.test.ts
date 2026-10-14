import { describe, expect, it } from 'vitest';
import { lifeSlices, startState } from '@game/data';
import { newGame, reduce } from '@game/reducer';
import { lifeSliceIds } from '@game/state';
import { currentSlice, grow, hasGrowth, sliceTabs } from './lifeSlices';

describe('tranches de vie', () => {
  it('décrit chaque tranche, dans l’ordre de la vie', () => {
    expect(lifeSlices.map(({ id }) => id)).toEqual([...lifeSliceIds]);
  });

  it('démarre en Jeunesse, le jeu complet', () => {
    expect(startState.lifeSlice).toBe('youth');
    expect(newGame().lifeSlice).toBe('youth');
    expect(hasGrowth(newGame())).toBe(false);
  });

  it('ouvre tous les onglets en Jeunesse et un seul avant 18 ans', () => {
    expect(sliceTabs(newGame())).toHaveLength(9);
    for (const id of ['earlyChildhood', 'childhood', 'adolescence'] as const) {
      expect(sliceTabs(newGame(undefined, id))).toEqual(['life']);
    }
  });

  it('commence une tranche avant 18 ans sans emploi ni anniversaire', () => {
    const state = newGame(undefined, 'childhood');
    expect(currentSlice(state)?.name).toBe('Enfance');
    expect(state.growth).toBe(0);
    expect(state.status).toBe('playing');
    expect(state.pendingBirthday).toBeNull();
    expect(hasGrowth(state)).toBe(true);
  });

  it('fait monter le compteur à chaque appui, une fois', () => {
    let state = newGame(undefined, 'earlyChildhood');
    state = reduce(state, { type: 'grow' });
    state = reduce(state, { type: 'grow' });
    expect(state.growth).toBe(2);
  });

  it('n’a pas de bouton en Jeunesse', () => {
    const state = newGame();
    expect(grow(state)).toBe(state);
    expect(reduce(state, { type: 'grow' }).growth).toBe(0);
  });

  it('ne grandit plus une fois la partie finie', () => {
    const dead = {
      ...newGame(undefined, 'adolescence'),
      status: 'dead' as const,
    };
    expect(grow(dead)).toBe(dead);
  });

  it('repart de la tranche demandée à chaque recommencement', () => {
    const played = reduce(newGame(undefined, 'childhood'), { type: 'grow' });
    const restarted = reduce(played, {
      type: 'restart',
      lifeSlice: 'adolescence',
    });
    expect(restarted.lifeSlice).toBe('adolescence');
    expect(restarted.growth).toBe(0);
    expect(reduce(played, { type: 'restart' }).lifeSlice).toBe('youth');
  });
});
