import { actionRules, jobs, startState } from '@game/data';
import type { GameState } from '@game/state';
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

  it('applique le multiplicateur de réputation de l’emploi', () => {
    const boosted = work({ ...startState, workReputationMultiplier: 2 });
    expect(boosted.reputation).toBeCloseTo((firstJob?.reputation ?? 0) * 2);
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

  it('refuse une entreprise qu’on ne possède pas', () => {
    expect(work(startState, 'atelier')).toBe(startState);
    expect(work(startState, 'nulle-part')).toBe(startState);
  });

  it('travailler dans une entreprise donne un bonus de période, pas de salaire', () => {
    const owner = { ...startState, companies: { atelier: 1 } };
    const next = work(owner, 'atelier');
    expect(next.workBoosts).toEqual({ atelier: 1 });
    expect(next.money).toBe(0);
    expect(next.reputation).toBe(0);
    expect(next.gauge).toBe(actionRules.work.gauge);
  });

  it('travailler dans une entreprise donne des marqueurs de Gestion', () => {
    let state: GameState = { ...startState, companies: { atelier: 1 } };
    for (let index = 0; index < 100; index++) {
      state = work({ ...state, gauge: 0 }, 'atelier');
    }
    expect(state.markers.length).toBeGreaterThan(0);
    expect(new Set(state.markers)).toEqual(new Set(['gestion']));
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
