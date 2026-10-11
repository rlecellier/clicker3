import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { isUnlocked } from './requirements';
import type { Requirement } from './requirements';

const stateWith = (changes: Partial<GameState>): GameState => ({
  ...startState,
  ...changes,
});

describe('isUnlocked', () => {
  it('teste un palier de stat', () => {
    const requirement: Requirement = { type: 'stat', stat: 'gestion', tier: 2 };
    const low = stateWith({ stats: { ...startState.stats, gestion: 29 } });
    const high = stateWith({ stats: { ...startState.stats, gestion: 30 } });
    expect(isUnlocked(low, requirement)).toBe(false);
    expect(isUnlocked(high, requirement)).toBe(true);
  });

  it('teste la réputation minimale', () => {
    const requirement: Requirement = { type: 'reputation', min: 5 };
    expect(isUnlocked(stateWith({ reputation: 4 }), requirement)).toBe(false);
    expect(isUnlocked(stateWith({ reputation: 5 }), requirement)).toBe(true);
  });

  it('teste le palier de réputation d’après le total gagné', () => {
    const requirement: Requirement = { type: 'reputationTier', tier: 1 };
    const spent = stateWith({ reputation: 0, reputationEarned: 10 });
    expect(isUnlocked(startState, requirement)).toBe(false);
    expect(isUnlocked(spent, requirement)).toBe(true);
  });

  it('teste un quartier débloqué', () => {
    const requirement: Requirement = { type: 'district', id: 'tilleuls' };
    expect(isUnlocked(startState, requirement)).toBe(true);
    expect(isUnlocked(stateWith({ districts: [] }), requirement)).toBe(false);
  });

  it('teste la phase de vie atteinte ou dépassée', () => {
    const requirement: Requirement = { type: 'phase', phase: 'entrepreneur' };
    expect(isUnlocked(startState, requirement)).toBe(false);
    expect(isUnlocked(stateWith({ phase: 'entrepreneur' }), requirement)).toBe(
      true,
    );
    expect(isUnlocked(stateWith({ phase: 'boss' }), requirement)).toBe(true);
  });

  it('teste l’âge minimum', () => {
    const requirement: Requirement = { type: 'age', min: 20 };
    expect(isUnlocked(stateWith({ period: 23 }), requirement)).toBe(false);
    expect(isUnlocked(stateWith({ period: 24 }), requirement)).toBe(true);
  });

  it('teste le nombre de périodes écoulées', () => {
    const requirement: Requirement = { type: 'period', min: 12 };
    expect(isUnlocked(stateWith({ period: 11 }), requirement)).toBe(false);
    expect(isUnlocked(stateWith({ period: 12 }), requirement)).toBe(true);
  });

  it('teste la possession d’une entreprise', () => {
    const one: Requirement = { type: 'company', id: 'shop' };
    const three: Requirement = { type: 'company', id: 'shop', count: 3 };
    const state = stateWith({ companies: { shop: 2 } });
    expect(isUnlocked(startState, one)).toBe(false);
    expect(isUnlocked(state, one)).toBe(true);
    expect(isUnlocked(state, three)).toBe(false);
  });

  it('teste une amélioration achetée', () => {
    const requirement: Requirement = { type: 'upgrade', id: 'notebook' };
    expect(isUnlocked(startState, requirement)).toBe(false);
    expect(isUnlocked(stateWith({ upgrades: ['notebook'] }), requirement)).toBe(
      true,
    );
  });

  describe('composition', () => {
    const rich: Requirement = { type: 'reputation', min: 1 };
    const old: Requirement = { type: 'age', min: 30 };
    const state = stateWith({ reputation: 3 });

    it('all exige toutes les conditions', () => {
      expect(isUnlocked(state, { type: 'all', of: [rich, old] })).toBe(false);
      expect(isUnlocked(state, { type: 'all', of: [rich] })).toBe(true);
      expect(isUnlocked(state, { type: 'all', of: [] })).toBe(true);
    });

    it('any exige au moins une condition', () => {
      expect(isUnlocked(state, { type: 'any', of: [old, rich] })).toBe(true);
      expect(isUnlocked(state, { type: 'any', of: [old] })).toBe(false);
      expect(isUnlocked(state, { type: 'any', of: [] })).toBe(false);
    });

    it('se compose récursivement', () => {
      const nested: Requirement = {
        type: 'all',
        of: [
          rich,
          { type: 'any', of: [old, { type: 'phase', phase: 'youngAdult' }] },
        ],
      };
      expect(isUnlocked(state, nested)).toBe(true);
    });
  });
});
