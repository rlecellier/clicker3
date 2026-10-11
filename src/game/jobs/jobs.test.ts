import { jobs, startState } from '@game/data';
import { gainReputation } from '@game/reputation';
import { changeJob } from './jobs';

describe('données des emplois', () => {
  it('liste les quatre emplois dans l’ordre', () => {
    expect(jobs.map((job) => job.id)).toEqual([
      'interim',
      'polyvalent',
      'mission',
      'transformation',
    ]);
  });

  it('commence au premier emploi', () => {
    expect(startState.jobId).toBe('interim');
  });
});

describe('changeJob', () => {
  const skilled = {
    ...startState,
    stats: { ...startState.stats, metier: 30 },
  };

  it('refuse si le palier de Métier manque', () => {
    expect(changeJob(startState, 'polyvalent')).toBe(startState);
  });

  it('prend l’emploi quand la condition est remplie', () => {
    expect(changeJob(skilled, 'polyvalent').jobId).toBe('polyvalent');
  });

  it('exige aussi la réputation pour les emplois 3 et 4, et la dépense', () => {
    expect(changeJob(skilled, 'mission')).toBe(skilled);

    const known = gainReputation(skilled, 12);
    const next = changeJob(known, 'mission');
    expect(next.jobId).toBe('mission');
    expect(next.reputation).toBe(12 - 10);
  });

  it('refuse l’emploi actuel, un emploi inconnu et un personnage mort', () => {
    expect(changeJob(skilled, 'interim')).toBe(skilled);
    expect(changeJob(skilled, 'nulle-part')).toBe(skilled);
    const dead = { ...skilled, status: 'dead' as const };
    expect(changeJob(dead, 'polyvalent')).toBe(dead);
  });
});
