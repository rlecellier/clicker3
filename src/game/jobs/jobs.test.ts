import { jobs, startState } from '@game/data';
import { gainReputation } from '@game/reputation';
import type { GameState } from '@game/state';
import { reduce } from '@game/reducer';
import { settleSleep, sleepStep } from '@game/sleep';
import { changeJob, monthlyWage, startingJobs } from './jobs';

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

describe('monthlyWage', () => {
  it('paie les 8 h de la journée : trois actions de travail', () => {
    const first = jobs[0];
    expect(first).toBeDefined();
    if (first === undefined) {
      return;
    }
    expect(monthlyWage(first)).toBe(first.salary * 3);
  });

  it('est ce que verse une journée sans heures supplémentaires', () => {
    const first = jobs[0];
    let state: GameState = { ...startState, jobId: 'interim' };
    for (let click = 0; click < 3; click += 1) {
      state = reduce(state, { type: 'work', target: 'job' });
    }
    const due = Object.values(state.wagesDue).reduce((a, b) => a + b, 0);
    expect(due).toBe(first === undefined ? 0 : monthlyWage(first));
  });
});

describe('startingJobs', () => {
  it('ne propose que l’intérim, sans prérequis ni coût', () => {
    expect(startingJobs.map((job) => job.id)).toEqual(['interim']);
  });
});

describe('premier emploi', () => {
  it('permet de vivre sans dette en ne faisant que travailler', () => {
    // Dix ans à l'intérim, sommeil compris : le loyer de départ est couvert.
    let state: GameState = { ...startState, jobId: 'interim' };
    let lowest = 0;
    while (state.period < 120) {
      // Une promotion arrête le jeu : on la refuse, pour ne compter que le salaire de base.
      if (state.pendingPromotion !== null) {
        state = reduce(state, { type: 'answerPromotion', isAccepted: false });
        continue;
      }
      state = settleSleep(
        state.isSleeping
          ? sleepStep(state)
          : reduce(state, { type: 'work', target: 'job' }),
      );
      lowest = Math.min(lowest, state.money);
    }
    expect(lowest).toBeGreaterThanOrEqual(0);
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
