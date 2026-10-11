import { startState } from '@game/data';
import { gainReputation } from '@game/reputation';
import { reduce } from './reduce';

describe('reduce', () => {
  it('applique addGauge', () => {
    const next = reduce(startState, { type: 'addGauge', amount: 250 });
    expect(next.period).toBe(2);
    expect(next.gauge).toBe(50);
  });

  it('laisse l’état d’origine intact', () => {
    const before = structuredClone(startState);
    reduce(startState, { type: 'addGauge', amount: 250 });
    expect(startState).toEqual(before);
  });

  it('applique unlockDistrict', () => {
    const state = gainReputation(startState, 12);
    const next = reduce(state, {
      type: 'unlockDistrict',
      id: 'hauts-fourneaux',
    });
    expect(next.districts).toContain('hauts-fourneaux');
  });

  it('ignore un unlockDistrict refusé', () => {
    const next = reduce(startState, {
      type: 'unlockDistrict',
      id: 'hauts-fourneaux',
    });
    expect(next).toBe(startState);
  });

  it('applique work, study, sleep et changeJob', () => {
    const worked = reduce(startState, { type: 'work', target: 'job' });
    expect(worked.money).toBeGreaterThan(0);

    const studied = reduce(worked, { type: 'study', courseId: 'metier' });
    expect(studied.money).toBeLessThan(worked.money);

    const rested = reduce(
      { ...startState, markers: ['metier'] },
      { type: 'sleep' },
    );
    expect(rested.stats.metier).toBe(1);

    const promoted = reduce(
      { ...startState, stats: { ...startState.stats, metier: 10 } },
      { type: 'changeJob', id: 'polyvalent' },
    );
    expect(promoted.jobId).toBe('polyvalent');
  });
});
