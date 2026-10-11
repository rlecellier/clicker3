import { actionRules, startState } from '@game/data';
import {
  fallAsleep,
  queueAction,
  settleSleep,
  sleepStep,
  sleepStepMs,
} from './sleep';

const full = {
  ...startState,
  markers: [
    'metier',
    'metier',
    'gestion',
    'gestion',
    'gestion',
  ] as typeof startState.markers,
};
const asleep = { ...full, isSleeping: true };

describe('fallAsleep', () => {
  it('endort un cerveau plein', () => {
    expect(fallAsleep(full).isSleeping).toBe(true);
  });

  it('laisse éveillé un cerveau qui n’est pas plein', () => {
    const partial = { ...full, markers: ['metier' as const] };
    expect(fallAsleep(partial)).toBe(partial);
  });

  it('ne change rien quand le personnage dort déjà', () => {
    expect(fallAsleep(asleep)).toBe(asleep);
  });

  it('n’endort pas un personnage mort', () => {
    const dead = { ...full, status: 'dead' as const };
    expect(fallAsleep(dead)).toBe(dead);
  });
});

describe('sleepStep', () => {
  it('convertit le premier marqueur en points de stat', () => {
    const next = sleepStep(asleep);
    expect(next.markers).toEqual(['metier', 'gestion', 'gestion', 'gestion']);
    expect(next.stats.metier).toBe(1);
    expect(next.stats.gestion).toBe(0);
  });

  it('fait passer le temps, un marqueur après l’autre', () => {
    expect(sleepStep(asleep).gauge).toBe(
      actionRules.sleep.gauge / startState.maxMarkers,
    );
  });

  it('applique le multiplicateur du logement', () => {
    const next = sleepStep({ ...asleep, sleepMultiplier: 2.5 });
    expect(next.stats.metier).toBe(2.5);
  });

  it('se réveille au dernier marqueur, après un sommeil complet', () => {
    let state = asleep;
    for (let index = 0; index < 4; index++) {
      state = sleepStep(state);
      expect(state.isSleeping).toBe(true);
    }
    state = sleepStep(state);
    expect(state.isSleeping).toBe(false);
    expect(state.markers).toEqual([]);
    expect(state.gauge).toBe(actionRules.sleep.gauge);
    expect(state.stats.metier).toBe(2);
    expect(state.stats.gestion).toBe(3);
  });

  it('ne fait rien quand le personnage est éveillé', () => {
    expect(sleepStep(full)).toBe(full);
  });

  it('ne fait rien quand le personnage est mort', () => {
    const dead = { ...asleep, status: 'dead' as const };
    expect(sleepStep(dead)).toBe(dead);
  });

  it('peut terminer la période', () => {
    const almostFull = { ...asleep, gauge: asleep.gaugeCapacity - 1 };
    expect(sleepStep(almostFull).period).toBe(1);
  });
});

describe('sleepStepMs', () => {
  it('répartit une demi-seconde sur les marqueurs', () => {
    expect(sleepStepMs(startState) * startState.maxMarkers).toBe(500);
    expect(sleepStepMs({ ...startState, maxMarkers: 10 })).toBe(50);
  });
});

describe('gestes gardés', () => {
  const work = { type: 'work', target: 'job' } as const;

  it('garde un geste dans l’ordre', () => {
    const next = queueAction(queueAction(asleep, work), {
      type: 'study',
      courseId: 'metier',
    });
    expect(next.queuedActions).toEqual([
      work,
      { type: 'study', courseId: 'metier' },
    ]);
  });

  it('ne garde rien quand le personnage est mort', () => {
    const dead = { ...asleep, status: 'dead' as const };
    expect(queueAction(dead, work)).toBe(dead);
  });

  it('plafonne la file', () => {
    let state = asleep;
    for (let index = 0; index < 80; index++) {
      state = queueAction(state, work);
    }
    expect(state.queuedActions).toHaveLength(50);
  });

  it('rejoue la file au réveil, le travail change l’état', () => {
    const woke = {
      ...startState,
      queuedActions: [work, work],
    };
    const next = settleSleep(woke);
    expect(next.queuedActions).toEqual([]);
    expect(next.money).toBeGreaterThan(0);
  });

  it('garde la file tant que le cerveau est plein', () => {
    const queued = { ...full, queuedActions: [work] };
    const next = settleSleep(queued);
    expect(next.isSleeping).toBe(true);
    expect(next.queuedActions).toEqual([work]);
    expect(next.money).toBe(0);
  });
});
