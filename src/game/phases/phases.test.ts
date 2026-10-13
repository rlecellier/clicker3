import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { reduce } from '@game/reducer';
import { isSenior, manualFactor, phaseOf, updatePhase } from './phases';

const stateWith = (changes: Partial<GameState>): GameState => ({
  ...startState,
  ...changes,
});

describe('phaseOf', () => {
  it('commence Jeune adulte', () => {
    expect(phaseOf(startState)).toBe('youngAdult');
  });

  it('passe Entrepreneur à la première entreprise', () => {
    expect(phaseOf(stateWith({ companies: { atelier: 1 } }))).toBe(
      'entrepreneur',
    );
  });

  it('passe Patron au premier employé', () => {
    const state = stateWith({
      companies: { atelier: 1 },
      upgrades: ['premier-collaborateur'],
    });
    expect(phaseOf(state)).toBe('boss');
  });

  it('ne redescend jamais', () => {
    expect(phaseOf(stateWith({ phase: 'boss' }))).toBe('boss');
  });

  it('se met à jour dans le reducer après un achat', () => {
    const rich = stateWith({
      money: 10_000_000,
      stockCapacity: 1_000_000,
      stats: { ...startState.stats, gestion: 100 },
    });
    const bought = reduce(rich, { type: 'buyCompany', id: 'atelier' });
    expect(bought.phase).toBe('entrepreneur');
    const hired = reduce(bought, {
      type: 'buyUpgrade',
      id: 'premier-collaborateur',
    });
    expect(hired.phase).toBe('boss');
  });
});

describe('updatePhase', () => {
  it('rend le même état quand la phase ne change pas', () => {
    expect(updatePhase(startState)).toBe(startState);
  });
});

const at = (age: number) =>
  stateWith({ period: (age - startState.life.startAge) * 12 });

describe('vieillesse', () => {
  it('commence à l’âge fixé dans les données', () => {
    expect(isSenior(at(59))).toBe(false);
    expect(isSenior(at(60))).toBe(true);
  });

  it('se cumule avec la phase atteinte', () => {
    const old = { ...at(61), phase: 'boss' as const };
    expect(isSenior(old)).toBe(true);
    expect(phaseOf(old)).toBe('boss');
  });

  it('réduit les gains des actions manuelles', () => {
    expect(manualFactor(at(30))).toBe(1);
    expect(manualFactor(at(60))).toBe(0.5);
  });

  it('réduit le salaire et la réputation du travail', () => {
    const young = reduce(at(30), { type: 'work', target: 'job' });
    const senior = reduce(at(60), { type: 'work', target: 'job' });
    expect(senior.ledger.total.wages).toBe(
      Math.round(young.ledger.total.wages * 0.5),
    );
    expect(senior.reputation).toBeCloseTo(young.reputation * 0.5);
  });

  it('réduit le bonus du travail en entreprise', () => {
    const owner = { companies: { atelier: 1 } };
    const young = reduce(
      { ...at(30), ...owner },
      {
        type: 'work',
        target: 'atelier',
      },
    );
    const senior = reduce(
      { ...at(60), ...owner },
      {
        type: 'work',
        target: 'atelier',
      },
    );
    expect(young.workBoosts['atelier']).toBe(1);
    expect(senior.workBoosts['atelier']).toBe(0.5);
  });
});
