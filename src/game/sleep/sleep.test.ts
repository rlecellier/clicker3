import { actionRules, automationRules, startState } from '@game/data';
import { sleep } from './sleep';

const tired = {
  ...startState,
  markers: ['metier', 'metier', 'gestion'] as typeof startState.markers,
};

describe('sleep', () => {
  it('convertit les marqueurs en points de stat et les consomme', () => {
    const next = sleep(tired);
    expect(next.markers).toEqual([]);
    expect(next.stats.metier).toBe(2);
    expect(next.stats.gestion).toBe(1);
    expect(next.stats.endurance).toBe(0);
  });

  it('remplit la jauge', () => {
    expect(sleep(tired).gauge).toBe(actionRules.sleep.gauge);
  });

  it('applique le multiplicateur du logement', () => {
    const next = sleep({ ...tired, sleepMultiplier: 2.5 });
    expect(next.stats.metier).toBe(5);
    expect(next.stats.gestion).toBe(3);
  });

  it('donne moins de points quand le sommeil est automatique', () => {
    const many = {
      ...startState,
      markers: Array.from({ length: 4 }, () => 'metier' as const),
    };
    expect(sleep(many).stats.metier).toBe(4);
    expect(sleep(many, true).stats.metier).toBe(
      Math.round(4 * automationRules.yieldFactor),
    );
  });

  it('refuse sans marqueur', () => {
    expect(sleep(startState)).toBe(startState);
  });

  it('refuse quand le personnage est mort', () => {
    const dead = { ...tired, status: 'dead' as const };
    expect(sleep(dead)).toBe(dead);
  });

  it('peut terminer la période', () => {
    const almostFull = { ...tired, gauge: tired.gaugeCapacity - 1 };
    expect(sleep(almostFull).period).toBe(1);
  });
});
