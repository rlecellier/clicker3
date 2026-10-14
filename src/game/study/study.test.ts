import {
  actionRules,
  courses,
  startState,
  statTierThresholds,
} from '@game/data';
import { canStudy, isStudiable, studiableCourses, study } from './study';

const course = courses[0];
const funded = { ...startState, money: 1000, upgrades: ['stage-posture'] };

describe('study', () => {
  it('coûte de l’argent et remplit la jauge', () => {
    const next = study(funded, 'metier');
    expect(next.money).toBe(1000 - (course?.cost ?? 0));
    expect(next.gauge).toBe(actionRules.study.minutes);
  });

  it('donne des marqueurs de la stat du cursus', () => {
    let state = funded;
    for (let index = 0; index < 50; index++) {
      state = study({ ...state, money: 1000, gauge: 0 }, 'metier');
    }
    expect(state.markers.length).toBeGreaterThan(0);
    expect(new Set(state.markers)).toEqual(new Set(['metier']));
  });

  it('refuse sans assez d’argent', () => {
    expect(study(startState, 'metier')).toBe(startState);
  });

  it('refuse à découvert', () => {
    const indebted = { ...funded, money: -10 };
    expect(study(indebted, 'metier')).toBe(indebted);
  });

  it('refuse un cursus dont la formation n’est pas achetée', () => {
    const untrained = { ...funded, upgrades: [] };
    expect(study(untrained, 'metier')).toBe(untrained);
  });

  it('refuse un cursus inconnu', () => {
    expect(study(funded, 'nulle-part')).toBe(funded);
  });

  it('refuse quand le personnage est mort', () => {
    const dead = { ...funded, status: 'dead' as const };
    expect(study(dead, 'metier')).toBe(dead);
  });

  it('peut terminer la période', () => {
    const almostFull = { ...funded, gauge: funded.gaugeCapacity - 1 };
    expect(study(almostFull, 'metier').period).toBe(1);
  });

  it('est déterministe pour une graine donnée', () => {
    expect(study(funded, 'metier')).toEqual(study(funded, 'metier'));
  });
});

const withMetier = (points: number) => ({
  ...funded,
  stats: { ...funded.stats, metier: points },
});
const lastTier = statTierThresholds.metier.at(-1) ?? 0;
const thirdTier = statTierThresholds.metier.at(-2) ?? 0;

describe('cursus étudiable', () => {
  it('l’est au palier 0', () => {
    expect(isStudiable(withMetier(0), 'metier')).toBe(true);
  });

  it('l’est au dernier palier moins un', () => {
    expect(isStudiable(withMetier(thirdTier), 'metier')).toBe(true);
  });

  it('ne l’est plus au dernier palier', () => {
    expect(isStudiable(withMetier(lastTier), 'metier')).toBe(false);
    expect(isStudiable(withMetier(lastTier + 50), 'metier')).toBe(false);
  });

  it('ne l’est pas si la formation n’est pas achetée', () => {
    expect(isStudiable({ ...funded, upgrades: [] }, 'metier')).toBe(false);
    expect(isStudiable(funded, 'nulle-part')).toBe(false);
  });

  it('ne liste que les cursus étudiables', () => {
    expect(studiableCourses(funded).map((item) => item.id)).toEqual(['metier']);
    expect(studiableCourses(withMetier(lastTier))).toEqual([]);
  });

  it('est refusé par canStudy et study au dernier palier', () => {
    const maxed = withMetier(lastTier);
    expect(canStudy(maxed, 'metier')).toBe(false);
    expect(study(maxed, 'metier')).toBe(maxed);
  });
});
