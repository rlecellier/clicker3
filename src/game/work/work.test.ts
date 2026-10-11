import { actionRules, jobs, startState } from '@game/data';
import { deepFreeze } from '@test/deepFreeze';
import { work } from './work';

const firstJob = jobs[0];

describe('work', () => {
  it('verse le salaire et un peu de réputation', () => {
    const next = work(startState);
    expect(next.money).toBe(firstJob?.salary);
    expect(next.reputation).toBeCloseTo(firstJob?.reputation ?? 0);
    expect(next.reputationEarned).toBeCloseTo(firstJob?.reputation ?? 0);
  });

  it('remplit la jauge du coût de l’action', () => {
    expect(work(startState).gauge).toBe(actionRules.work.gauge);
  });

  it('peut terminer la période', () => {
    const almostFull = { ...startState, gauge: startState.gaugeCapacity - 1 };
    const next = work(almostFull);
    expect(next.period).toBe(1);
    expect(next.gauge).toBe(actionRules.work.gauge - 1);
  });

  it('donne des marqueurs de Métier, sans dépasser le maximum', () => {
    let state = startState;
    const seen = new Set<number>();
    for (let index = 0; index < 200; index++) {
      state = work({ ...state, gauge: 0, status: 'playing' });
      seen.add(state.markers.length);
    }
    expect(state.markers.length).toBeLessThanOrEqual(state.maxMarkers);
    expect(state.markers.length).toBe(state.maxMarkers);
    expect(new Set(state.markers)).toEqual(new Set(['metier']));
  });

  it('est déterministe pour une graine donnée', () => {
    expect(work(startState)).toEqual(work(startState));
  });

  it('refuse de travailler quand le personnage est mort', () => {
    const dead = { ...startState, status: 'dead' as const };
    expect(work(dead)).toBe(dead);
  });

  it('refuse une cible autre que l’emploi (entreprises : V1-07)', () => {
    expect(work(startState, 'some-company')).toBe(startState);
  });

  it('refuse sans emploi', () => {
    const jobless = { ...startState, jobId: null };
    expect(work(jobless)).toBe(jobless);
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(startState));
    expect(() => work(frozen)).not.toThrow();
  });
});
