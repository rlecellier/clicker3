import { startState } from '@game/data';
import { newGame } from '@game/reducer';
import type { GameState } from '@game/state';
import { markAllSeen, markSeen, newItems } from './novelty';

const withStats = (metier: number, gestion = 0): GameState => ({
  ...startState,
  stats: { ...startState.stats, metier, gestion },
});

describe('newItems', () => {
  it('ne signale rien au départ', () => {
    for (const tab of ['skills', 'jobs', 'invest', 'city'] as const) {
      expect(newItems(startState, tab)).toEqual([]);
    }
  });

  it('signale les emplois dont la condition est remplie', () => {
    expect(newItems(withStats(2), 'jobs')).toEqual(['job:polyvalent']);
  });

  it('signale entreprises et améliorations dans Investir', () => {
    const ids = newItems(withStats(2, 2), 'invest');
    expect(ids.some((id) => id.startsWith('company:'))).toBe(true);
    expect(ids.some((id) => id.startsWith('upgrade:'))).toBe(true);
  });

  it('signale un palier de compétence', () => {
    expect(newItems(withStats(2), 'skills')).toEqual(['stat:metier:1']);
    expect(newItems(withStats(9), 'skills')).toEqual([
      'stat:metier:1',
      'stat:metier:2',
    ]);
  });

  it('signale un quartier à la fois dans Investir et Ville', () => {
    const state: GameState = { ...startState, reputationEarned: 6 };
    expect(newItems(state, 'city')).toEqual(['district:hauts-fourneaux']);
    expect(newItems(state, 'invest')).toContain('district:hauts-fourneaux');
    expect(newItems(state, 'skills')).toEqual(['reputation:1']);
  });

  it('ne dépend pas de l’argent', () => {
    expect(newItems({ ...withStats(2), money: 0 }, 'jobs')).toEqual(
      newItems({ ...withStats(2), money: 1e6 }, 'jobs'),
    );
  });
});

describe('markSeen', () => {
  it('éteint l’onglet visité et laisse les autres', () => {
    const state = markSeen(withStats(2, 2), 'jobs');
    expect(newItems(state, 'jobs')).toEqual([]);
    expect(newItems(state, 'invest')).not.toEqual([]);
  });

  it('rend le même état quand rien n’est nouveau', () => {
    expect(markSeen(startState, 'jobs')).toBe(startState);
  });

  it('ne rallume pas ce qui redevient accessible', () => {
    const seen = markSeen(withStats(2), 'jobs');
    const lost = { ...seen, stats: startState.stats };
    expect(newItems(lost, 'jobs')).toEqual([]);
    expect(newItems({ ...lost, stats: seen.stats }, 'jobs')).toEqual([]);
  });

  it('signale seulement ce qui s’ajoute ensuite', () => {
    const seen = markSeen(withStats(2), 'skills');
    expect(newItems({ ...seen, stats: withStats(9).stats }, 'skills')).toEqual([
      'stat:metier:2',
    ]);
  });
});

describe('markAllSeen', () => {
  it('voit tous les onglets', () => {
    const state = markAllSeen(withStats(41, 41));
    for (const tab of ['skills', 'jobs', 'invest', 'city'] as const) {
      expect(newItems(state, tab)).toEqual([]);
    }
  });

  it('une nouvelle vie démarre sans nouveauté', () => {
    expect(newItems(newGame(), 'invest')).toEqual([]);
  });
});
