import { startState } from '@game/data';
import { grantMarker } from './markers';

const repeat = (
  times: number,
  share: number,
  state: typeof startState = startState,
) => {
  let current = { ...state, maxMarkers: 1000 };
  for (let index = 0; index < times; index++) {
    current = grantMarker(current, 'metier', share);
  }
  return current;
};

describe('grantMarker', () => {
  it('donne un marqueur quand la part atteint 1', () => {
    expect(grantMarker(startState, 'metier', 1).markers).toEqual(['metier']);
  });

  it('n’en donne pas quand la part est nulle', () => {
    expect(grantMarker(startState, 'metier', 0).markers).toEqual([]);
  });

  it('en donne un toutes les n actions, sans hasard', () => {
    const first = repeat(100, 0.25);
    const second = repeat(100, 0.25);
    expect(first.markers).toHaveLength(25);
    expect(second).toEqual(first);
  });

  it('donne exactement 3 marqueurs en 10 actions à 0,3', () => {
    expect(repeat(10, 0.3).markers).toHaveLength(3);
  });

  it('garde l’avancement entre deux actions', () => {
    const after = grantMarker(startState, 'metier', 0.3);
    expect(after.markers).toEqual([]);
    expect(after.markerProgress.metier).toBeCloseTo(0.3);
  });

  it('perd le marqueur au maximum', () => {
    const full = {
      ...startState,
      markers: Array.from({ length: 5 }, () => 'gestion' as const),
    };
    const next = grantMarker(full, 'metier', 1);
    expect(next.markers).toHaveLength(5);
    expect(next.markers).not.toContain('metier');
  });

  it('relève la part avec l’agenda électronique', () => {
    const plain = repeat(100, 0.5);
    const noted = repeat(100, 0.5, {
      ...startState,
      upgrades: ['agenda-electronique'],
    });
    expect(plain.markers).toHaveLength(50);
    expect(noted.markers).toHaveLength(65);
  });
});
