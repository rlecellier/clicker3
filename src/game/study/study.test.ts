import { actionRules, courses, startState } from '@game/data';
import { study } from './study';

const course = courses[0];
const funded = { ...startState, money: 1000 };

describe('study', () => {
  it('coûte de l’argent et remplit la jauge', () => {
    const next = study(funded, 'metier');
    expect(next.money).toBe(1000 - (course?.cost ?? 0));
    expect(next.gauge).toBe(actionRules.study.gauge);
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

  it('refuse un cursus inconnu ou une condition manquante', () => {
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
