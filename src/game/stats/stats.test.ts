import { startState } from '@game/data';
import { statProgress, tierAt, tierOf, tierProgress } from './stats';

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
    expect(tierOf(withPoints(5), 'metier')).toBe(1);
    expect(tierOf(withPoints(6), 'metier')).toBe(2);
    expect(tierOf(withPoints(699), 'metier')).toBe(7);
  });

  it('plafonne au dernier palier', () => {
    expect(tierOf(withPoints(100_000), 'metier')).toBe(8);
  });

  it('ne regarde que la stat demandée', () => {
    expect(tierOf(withPoints(700), 'gestion')).toBe(0);
  });
});

describe('statProgress', () => {
  it('part de zéro au palier 0', () => {
    expect(statProgress(startState, 'metier')).toEqual({
      tier: 0,
      points: 0,
      value: 0,
      max: 2,
      isMax: false,
    });
  });

  it('mesure la progression dans le palier en cours', () => {
    expect(statProgress(withPoints(1), 'metier')).toMatchObject({
      tier: 0,
      value: 1,
      max: 2,
    });
    expect(statProgress(withPoints(20), 'metier')).toMatchObject({
      tier: 3,
      value: 5,
      max: 20,
    });
  });

  it('repart de zéro quand le seuil est atteint pile', () => {
    expect(statProgress(withPoints(6), 'metier')).toMatchObject({
      tier: 2,
      value: 0,
      max: 9,
    });
  });

  it('est pleine au dernier palier', () => {
    expect(statProgress(withPoints(700), 'metier')).toMatchObject({
      tier: 8,
      value: 1,
      max: 1,
      isMax: true,
    });
  });
});

describe('tierProgress', () => {
  const thresholds = [2, 9, 41];

  it('compte les seuils franchis', () => {
    expect(tierAt(thresholds, 0)).toBe(0);
    expect(tierAt(thresholds, 9)).toBe(2);
    expect(tierAt(thresholds, 100)).toBe(3);
  });

  it('mesure la progression dans le palier en cours', () => {
    expect(tierProgress(thresholds, 1)).toEqual({
      tier: 0,
      value: 1,
      max: 2,
      isMax: false,
    });
    expect(tierProgress(thresholds, 12)).toEqual({
      tier: 2,
      value: 3,
      max: 32,
      isMax: false,
    });
  });

  it('remplit la barre au dernier palier', () => {
    expect(tierProgress(thresholds, 41)).toEqual({
      tier: 3,
      value: 1,
      max: 1,
      isMax: true,
    });
  });
});
