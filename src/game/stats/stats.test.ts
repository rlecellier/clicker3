import { startState } from '@game/data';
import { tierOf } from './stats';

const withPoints = (metier: number) => ({
  ...startState,
  stats: { ...startState.stats, metier },
});

describe('tierOf', () => {
  it('est à 0 au départ', () => {
    expect(tierOf(startState, 'metier')).toBe(0);
  });

  it('monte d’un palier quand le seuil est atteint', () => {
    expect(tierOf(withPoints(1), 'metier')).toBe(0);
    expect(tierOf(withPoints(2), 'metier')).toBe(1);
    expect(tierOf(withPoints(40), 'metier')).toBe(2);
    expect(tierOf(withPoints(41), 'metier')).toBe(3);
  });

  it('plafonne au dernier palier', () => {
    expect(tierOf(withPoints(100_000), 'metier')).toBe(4);
  });

  it('ne regarde que la stat demandée', () => {
    expect(tierOf(withPoints(81), 'gestion')).toBe(0);
  });
});
