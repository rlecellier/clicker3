import { startState } from '@game/data';
import { grantMarker } from './markers';

const count = (upgrades: string[]) => {
  let state = { ...startState, upgrades, maxMarkers: 1000 };
  for (let index = 0; index < 400; index++) {
    state = grantMarker(state, 'metier', 0.5, 0);
  }
  return state.markers.length;
};

describe('grantMarker', () => {
  it('donne un marqueur quand la chance est certaine', () => {
    const next = grantMarker(startState, 'metier', 10, 0);
    expect(next.markers).toEqual(['metier']);
  });

  it('n’en donne pas quand la chance est nulle', () => {
    const next = grantMarker(startState, 'metier', 0, 0);
    expect(next.markers).toEqual([]);
  });

  it('perd le marqueur au maximum', () => {
    const full = {
      ...startState,
      markers: Array.from({ length: 5 }, () => 'gestion' as const),
    };
    const next = grantMarker(full, 'metier', 10, 0);
    expect(next.markers).toHaveLength(5);
    expect(next.markers).not.toContain('metier');
  });

  it('fait avancer la graine même sans marqueur', () => {
    expect(grantMarker(startState, 'metier', 0, 0).seed).not.toBe(
      startState.seed,
    );
  });

  it('est déterministe pour une graine donnée', () => {
    expect(grantMarker(startState, 'metier', 0.5, 0.5)).toEqual(
      grantMarker(startState, 'metier', 0.5, 0.5),
    );
  });

  it('relève la chance avec l’agenda électronique', () => {
    const plain = count([]);
    const noted = count(['agenda-electronique']);
    expect(plain).toBeGreaterThan(150);
    expect(plain).toBeLessThan(250);
    expect(noted - plain).toBeGreaterThan(30);
  });
});
