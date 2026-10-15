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
    for (const id of ['childhood', 'adolescence'] as const) {
      expect(sliceTabs(newGame(undefined, id))).toEqual(['life']);
    }
    // La petite enfance ajoute le Caractère et les Relations ; la Maison attend
    // le premier objet.
    expect(sliceTabs(newGame(undefined, 'earlyChildhood'))).toEqual([
      'life',
      'character',
      'relations',
    ]);
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

  it('range la situation de naissance choisie, dans toute tranche', () => {
    expect(newGame().birthSituation).toBe('standard');
    for (const lifeSlice of lifeSliceIds) {
      const state = newGame(undefined, lifeSlice, 'standard');
      expect(state.birthSituation, lifeSlice).toBe('standard');
    }
  });

  it('ignore une situation inconnue et la garde au recommencement', () => {
    expect(
      newGame(undefined, 'earlyChildhood', 'inconnue').birthSituation,
    ).toBe('standard');
    const restarted = reduce(newGame(), {
      type: 'restart',
      lifeSlice: 'earlyChildhood',
      birthSituation: 'standard',
    });
    expect(restarted.lifeSlice).toBe('earlyChildhood');
    expect(restarted.birthSituation).toBe('standard');
  });
});
