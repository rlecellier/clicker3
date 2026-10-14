import { actionRules, startState } from '@game/data';
import type { GameState } from '@game/state';
import { withModifiers } from '@game/upgrades';
import { sleep } from './sleep';

const brain = (markers: GameState['markers']): GameState => ({
  ...startState,
  markers,
});

// Points de Métier qu'un seul marqueur donne après la nuit.
const points = (state: GameState) =>
  sleep({ ...state, markers: ['metier'] }).stats.metier;

const owning = (...upgrades: string[]) =>
  withModifiers({ ...startState, upgrades });

describe('sleep', () => {
  it('convertit tous les marqueurs d’un coup, sans pause', () => {
    const next = sleep(brain(['metier', 'metier', 'gestion']));
    expect(next.markers).toEqual([]);
    expect(next.stats.metier).toBe(2 * actionRules.sleep.pointsPerMarker);
    expect(next.stats.gestion).toBe(actionRules.sleep.pointsPerMarker);
    expect(next.lastNightMarkers).toBe(3);
  });

  it('garde le bilan d’une nuit sans marqueur', () => {
    const next = sleep({ ...brain([]), lastNightMarkers: 4 });
    expect(next.lastNightMarkers).toBe(0);
    expect(next.stats).toEqual(startState.stats);
  });

  it('applique le logement', () => {
    const housed = { ...brain(['metier']), sleepMultiplier: 2.5 };
    expect(sleep(housed).stats.metier).toBe(2.5);
  });

  it('applique un coup de pouce de sommeil', () => {
    const boosted: GameState = {
      ...brain(['metier']),
      activeEffects: [
        { eventId: 'clinique-sommeil', kind: 'sleepBoost', value: 1, until: 5 },
      ],
    };
    expect(sleep(boosted).stats.metier).toBe(2);
  });

  it('ne dort pas une fois le personnage mort', () => {
    const dead: GameState = {
      ...brain(['metier']),
      status: 'dead',
    };
    expect(sleep(dead)).toBe(dead);
  });

  describe('rendement d’apprentissage', () => {
    it('vaut 1 à la base de sommeil', () => {
      expect(points(startState)).toBe(1);
    });

    it('monte quand on dort plus : 9 h au lieu de 8 apprennent mieux', () => {
      expect(points(owning('matelas-memoire'))).toBeCloseTo(9 / 8);
    });

    it('ne baisse pas quand on dort moins : on apprend pareil', () => {
      const optimized = owning('application-sommeil');
      expect(optimized.sleepLessHours).toBe(1);
      expect(points(optimized)).toBe(1);
    });

    it('se compose : dormir plus puis moins garde le gain', () => {
      const both = owning('matelas-memoire', 'application-sommeil');
      expect(points(both)).toBeCloseTo(9 / 8);
    });
  });
});
