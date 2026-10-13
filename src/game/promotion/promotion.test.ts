import { actionRules, jobs, startState } from '@game/data';
import { autoTick, isTimeRunning } from '@game/automation';
import { reduce } from '@game/reducer';
import type { GameState } from '@game/state';
import { overtimeWageFactor } from '@game/overtime';
import { jobWage } from '@game/work';
import { answerPromotion, offerPromotion } from './promotion';

const { overtimeActions, raise } = actionRules.work.promotion;
const jobId = startState.jobId ?? '';
const firstThreshold = overtimeActions[0] ?? 0;

const stateWith = (changes: Partial<GameState>): GameState => ({
  ...startState,
  ...changes,
});

// Un état au bord de la première promotion : la prochaine action de travail est
// payée en heures supplémentaires et atteint le seuil.
const onTheEdge = (rank = 0): GameState =>
  stateWith({
    overtimeActions: { [jobId]: (overtimeActions[rank] ?? 0) - 1 },
    promotionsOffered: { [jobId]: rank },
    gauge: 40,
    gaugeSegments: [{ kind: 'work', amount: 40 }],
  });

const offered = (): GameState =>
  reduce(onTheEdge(), { type: 'work', target: 'job' });

describe('seuils', () => {
  it('sont croissants et au nombre de trois', () => {
    expect(overtimeActions).toHaveLength(3);
    expect(overtimeActions).toEqual(overtimeActions.toSorted((a, b) => a - b));
  });
});

describe('compte des heures supplémentaires', () => {
  it('ne compte pas les heures normales', () => {
    const next = reduce(startState, { type: 'work', target: 'job' });
    expect(next.overtimeActions[jobId] ?? 0).toBe(0);
  });

  it('compte une action en heures supplémentaires', () => {
    const next = reduce(
      stateWith({
        gauge: 40,
        gaugeSegments: [{ kind: 'work', amount: 40 }],
      }),
      { type: 'work', target: 'job' },
    );
    expect(next.overtimeActions[jobId]).toBe(1);
  });
});

describe('offre', () => {
  it('se déclenche au seuil et arrête le jeu', () => {
    const state = offered();
    expect(state.pendingPromotion).toEqual({ jobId, rank: 0 });
    expect(isTimeRunning({ ...state, autoWork: true })).toBe(false);
  });

  it('ne se déclenche pas avant le seuil', () => {
    const before = stateWith({
      overtimeActions: { [jobId]: firstThreshold - 2 },
      gauge: 40,
      gaugeSegments: [{ kind: 'work', amount: 40 }],
    });
    const next = reduce(before, { type: 'work', target: 'job' });
    expect(next.pendingPromotion).toBeNull();
  });

  it('ne repropose pas une offre en attente', () => {
    const state = offered();
    expect(offerPromotion(state)).toBe(state);
  });

  it('bloque les actions de temps jusqu’à la réponse', () => {
    const state = offered();
    expect(reduce(state, { type: 'work', target: 'job' })).toBe(state);
    expect(reduce(state, { type: 'study', courseId: 'x' })).toBe(state);
    expect(reduce(state, { type: 'addGauge', amount: 5, kind: 'work' })).toBe(
      state,
    );
  });

  it('arrête le travail automatique', () => {
    const state = {
      ...offered(),
      upgrades: ['procedure-travail'],
      autoWork: true,
    };
    expect(autoTick(state, 10_000)).toBe(state);
  });

  it('laisse lire le courrier', () => {
    const state = offered();
    const read = reduce(state, { type: 'readMail' });
    expect(read.pendingPromotion).toEqual(state.pendingPromotion);
    expect(read.mailRead).toBe(read.mailReceived);
  });
});

describe('réponse', () => {
  it('accepter augmente le salaire de l’emploi', () => {
    const state = offered();
    const wage = jobWage(state);
    const next = reduce(state, { type: 'answerPromotion', isAccepted: true });
    expect(next.pendingPromotion).toBeNull();
    expect(next.promotionsOffered[jobId]).toBe(1);
    expect(next.jobSalaryFactors[jobId]).toBeCloseTo(1 + raise);
    expect(jobWage(next)).toBeGreaterThan(wage);
    expect(jobWage(next)).toBe(
      Math.round(
        (jobs.find((job) => job.id === jobId)?.salary ?? 0) *
          overtimeWageFactor(next) *
          (1 + raise),
      ),
    );
  });

  it('refuser ne change pas le salaire mais consomme l’offre', () => {
    const state = offered();
    const next = reduce(state, { type: 'answerPromotion', isAccepted: false });
    expect(next.pendingPromotion).toBeNull();
    expect(next.promotionsOffered[jobId]).toBe(1);
    expect(next.jobSalaryFactors).toEqual(state.jobSalaryFactors);
    expect(jobWage(next)).toBe(jobWage(state));
  });

  it('écrit la réponse au courrier, dans les deux cas', () => {
    for (const isAccepted of [true, false]) {
      const state = offered();
      const next = reduce(state, { type: 'answerPromotion', isAccepted });
      expect(next.mailReceived).toBe(state.mailReceived + 1);
      expect(next.events.at(-1)?.id).toBe(`promotion-${jobId}-0`);
    }
  });

  it('rend l’état inchangé sans offre', () => {
    expect(answerPromotion(startState, true)).toBe(startState);
  });

  it('reprend le jeu ensuite', () => {
    const next = reduce(offered(), {
      type: 'answerPromotion',
      isAccepted: true,
    });
    expect(reduce(next, { type: 'work', target: 'job' })).not.toBe(next);
  });
});

describe('trois promotions par emploi', () => {
  it('propose les rangs 1, 2 puis 3, jamais une quatrième', () => {
    let state = stateWith({});
    for (const [rank, threshold] of overtimeActions.entries()) {
      state = {
        ...state,
        overtimeActions: { [jobId]: threshold - 1 },
        gauge: 40,
        gaugeSegments: [{ kind: 'work', amount: 40 }],
      };
      state = reduce(state, { type: 'work', target: 'job' });
      expect(state.pendingPromotion).toEqual({ jobId, rank });
      state = reduce(state, { type: 'answerPromotion', isAccepted: true });
    }
    expect(state.jobSalaryFactors[jobId]).toBeCloseTo((1 + raise) ** 3);
    const after = reduce(
      { ...state, overtimeActions: { [jobId]: 10_000 } },
      { type: 'work', target: 'job' },
    );
    expect(after.pendingPromotion).toBeNull();
  });
});
