import { startState, upgrades } from '@game/data';
import { isUnlocked } from '@game/requirements';
import { newGame } from '@game/reducer';
import type { GameState } from '@game/state';
import { markAllSeen, markSeen, newItems, noveltyTabs } from './novelty';

const withStats = (metier: number, gestion = 0): GameState => ({
  ...startState,
  stats: { ...startState.stats, metier, gestion },
});

// Les paliers de compétence et de réputation, sans les améliorations que le
// profil signale aussi.
const skillItems = (state: GameState) =>
  newItems(state, 'profile').filter((id) => !id.startsWith('upgrade:'));

describe('newItems', () => {
  it('ne signale rien au départ', () => {
    for (const tab of noveltyTabs) {
      expect(newItems(startState, tab)).toEqual([]);
    }
  });

  it('signale les emplois dont la condition est remplie', () => {
    expect(newItems(withStats(2), 'jobs')).toEqual(['job:polyvalent']);
  });

  it('signale les entreprises dans Entreprises et les améliorations dans Améliorations', () => {
    const state = withStats(2, 6);
    const companyIds = newItems(state, 'companies');
    const upgradeIds = newItems(state, 'upgrades');
    expect(companyIds.some((id) => id.startsWith('company:'))).toBe(true);
    expect(companyIds.some((id) => id.startsWith('upgrade:'))).toBe(false);
    expect(upgradeIds.length).toBeGreaterThan(0);
    expect(upgradeIds.every((id) => id.startsWith('upgrade:'))).toBe(true);
  });

  it('range chaque amélioration débloquée dans la vue de sa portée', () => {
    const state = withStats(9, 9);
    const companyView = newItems(state, 'companies');
    const profileView = newItems(state, 'profile');
    for (const upgrade of upgrades) {
      if (
        upgrade.requirement === undefined ||
        !isUnlocked(state, upgrade.requirement)
      ) {
        continue;
      }
      const [inView, outOfView] =
        upgrade.scope === 'company'
          ? [companyView, profileView]
          : [profileView, companyView];
      expect(inView, upgrade.id).toContain(`upgrade:${upgrade.id}`);
      expect(outOfView, upgrade.id).not.toContain(`upgrade:${upgrade.id}`);
    }
  });

  it('signale un palier de compétence', () => {
    expect(skillItems(withStats(2))).toEqual(['stat:metier:1']);
    expect(skillItems(withStats(6))).toEqual([
      'stat:metier:1',
      'stat:metier:2',
    ]);
  });

  it('signale un quartier à la fois dans Entreprises et Ville', () => {
    const state: GameState = { ...startState, reputationEarned: 6 };
    expect(newItems(state, 'city')).toEqual(['district:hauts-fourneaux']);
    expect(newItems(state, 'companies')).toContain('district:hauts-fourneaux');
    expect(skillItems(state)).toEqual(['reputation:1']);
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
    expect(newItems(state, 'companies')).not.toEqual([]);
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
    const seen = markSeen(withStats(2), 'profile');
    expect(newItems({ ...seen, stats: withStats(9).stats }, 'profile')).toEqual(
      ['stat:metier:2'],
    );
  });
});

describe('markAllSeen', () => {
  it('voit tous les onglets', () => {
    const state = markAllSeen(withStats(41, 41));
    for (const tab of noveltyTabs) {
      expect(newItems(state, tab)).toEqual([]);
    }
  });

  it('une nouvelle vie démarre sans nouveauté', () => {
    expect(newItems(newGame(), 'companies')).toEqual([]);
  });
});
