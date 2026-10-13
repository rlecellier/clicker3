import { wagesDueOf } from '@game/economy';
import { actionRules, startState } from '@game/data';
import {
  bedtimeGauge,
  fallAsleep,
  queueAction,
  setSleepHours,
  settleSleep,
  sleepGauge,
  sleepMarkers,
  sleepStep,
  sleepStepMs,
} from './sleep';

const markers = [
  'metier',
  'metier',
  'gestion',
  'gestion',
  'gestion',
] as typeof startState.markers;
const full = { ...startState, markers };
// 8 h : cinq pas, une heure de coucher à 16/24 de la jauge.
const asleep = {
  ...full,
  isSleeping: true,
  sleepLeft: 5,
  sleepTotal: 5,
  sleepStepGauge: sleepGauge(startState) / 5,
  sleepConvertible: 5,
};
const bedtime = { ...startState, gauge: bedtimeGauge(startState) };

// L'état qui dort `hours` heures dans la période en cours.
const sleepingFor = (state: typeof startState, hours: number) => ({
  ...state,
  sleepHours: hours,
  periodSleepHours: hours,
});

const count = (hours: number) => sleepMarkers(sleepingFor(startState, hours));

describe('horaire', () => {
  it('place le coucher sur l’horloge, depuis le réveil de 7 h', () => {
    const at = (hours: number) => bedtimeGauge(sleepingFor(startState, hours));
    const { gaugeCapacity } = startState;
    expect(at(8)).toBeCloseTo((16 * gaugeCapacity) / 24);
    expect(at(9)).toBeCloseTo((15 * gaugeCapacity) / 24);
    expect(at(7)).toBeCloseTo((17 * gaugeCapacity) / 24);
    expect(at(4)).toBeCloseTo((19 * gaugeCapacity) / 24);
  });

  it('couche plus tard et réveille plus tôt quand on dort moins', () => {
    const { schedule, hours } = actionRules.sleep;
    for (const [h, { bed, wake }] of Object.entries(schedule)) {
      expect((wake - bed + 24) % 24).toBe(Number(h));
    }
    expect(Object.keys(schedule).map(Number)).toEqual(
      Array.from(
        { length: hours.max - hours.min + 1 },
        (_, index) => hours.min + index,
      ),
    );
  });

  it('coûte les heures dormies sur les 24 de la jauge', () => {
    expect(sleepGauge(startState)).toBeCloseTo(
      (8 * startState.gaugeCapacity) / 24,
    );
    expect(sleepGauge(sleepingFor(startState, 4))).toBeCloseTo(
      (4 * startState.gaugeCapacity) / 24,
    );
  });

  it('vide plus de marqueurs quand on dort plus', () => {
    // 9 h vident tout le cerveau de départ ; chaque heure de moins, un marqueur
    // de moins, et 4 h aucun.
    expect(count(9)).toBe(startState.maxMarkers);
    expect([4, 5, 6, 7, 8, 9].map((hours) => count(hours))).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
  });
});

describe('setSleepHours', () => {
  it('choisit une durée entière entre 4 et 9 h', () => {
    expect(setSleepHours(startState, 6).sleepHours).toBe(6);
    expect(setSleepHours(startState, 9).sleepHours).toBe(9);
  });

  it('ne sert qu’à la période suivante : rien ne change dans celle-ci', () => {
    const chosen = setSleepHours(startState, 9);
    expect(chosen.periodSleepHours).toBe(8);
    expect(bedtimeGauge(chosen)).toBe(bedtimeGauge(startState));
    // Même passé le nouveau coucher, on ne s'endort pas avant l'ancien.
    const late = { ...chosen, gauge: bedtimeGauge(startState) - 1 };
    expect(fallAsleep(late)).toBe(late);
  });

  it('refuse une durée hors bornes ou fractionnaire', () => {
    for (const hours of [3, 10, 7.5, NaN]) {
      expect(setSleepHours(startState, hours)).toBe(startState);
    }
  });

  it('reste possible pendant un sommeil, sans le changer', () => {
    const next = setSleepHours(asleep, 6);
    expect(next.sleepHours).toBe(6);
    expect(next.sleepStepGauge).toBe(asleep.sleepStepGauge);
    expect(next.sleepTotal).toBe(asleep.sleepTotal);
  });
});

describe('fallAsleep', () => {
  it('endort à l’heure du coucher, même cerveau vide', () => {
    const next = fallAsleep(bedtime);
    expect(next.isSleeping).toBe(true);
    expect(next.sleepLeft).toBe(4);
    expect(next.sleepTotal).toBe(4);
    expect(next.sleepConvertible).toBe(4);
    expect(next.sleepStepGauge).toBeCloseTo(sleepGauge(startState) / 4);
    expect(next.lastSleepPeriod).toBe(0);
  });

  it('laisse éveillé avant l’heure du coucher, cerveau plein ou non', () => {
    expect(fallAsleep(startState)).toBe(startState);
    expect(fallAsleep(full)).toBe(full);
  });

  it('dort une seule fois par période', () => {
    const slept = { ...bedtime, lastSleepPeriod: 0 };
    expect(fallAsleep(slept)).toBe(slept);
    expect(fallAsleep({ ...slept, period: 1 }).isSleeping).toBe(true);
  });

  it('couche plus tard quand on dort moins', () => {
    const short = {
      ...sleepingFor(startState, 4),
      gauge: bedtimeGauge(bedtime),
    };
    expect(fallAsleep(short)).toBe(short);
  });

  it('rattrape une période entière sans sommeil, au réveil', () => {
    // Une action a traversé le coucher et la fin de période : la période 0 n'a
    // pas eu de sommeil.
    const skipped = { ...startState, period: 1, gauge: 3 };
    const next = fallAsleep(skipped);
    expect(next.isSleeping).toBe(true);
    expect(next.lastSleepPeriod).toBe(1);
  });

  it('ne rattrape rien au départ', () => {
    expect(fallAsleep(startState)).toBe(startState);
  });

  it('ne change rien quand le personnage dort déjà', () => {
    expect(fallAsleep(asleep)).toBe(asleep);
  });

  it('n’endort pas un personnage mort', () => {
    const dead = { ...bedtime, status: 'dead' as const };
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

  it('fait passer le temps, un pas après l’autre', () => {
    expect(sleepStep(asleep).gauge).toBeCloseTo(sleepGauge(asleep) / 5);
  });

  it('applique le multiplicateur du logement', () => {
    const next = sleepStep({ ...asleep, sleepMultiplier: 2.5 });
    expect(next.stats.metier).toBe(2.5);
  });

  it('se réveille au dernier pas, après un sommeil complet', () => {
    let state = asleep;
    for (let index = 0; index < 4; index++) {
      state = sleepStep(state);
      expect(state.isSleeping).toBe(true);
    }
    state = sleepStep(state);
    expect(state.isSleeping).toBe(false);
    expect(state.markers).toEqual([]);
    expect(state.gauge).toBeCloseTo(sleepGauge(asleep));
    expect(state.stats.metier).toBe(2);
    expect(state.stats.gestion).toBe(3);
  });

  it('dort moins : moins de marqueurs vidés, moins de jauge', () => {
    const short = sleepingFor(full, 4);
    let state = fallAsleep({ ...short, gauge: bedtimeGauge(short) });
    const before = state.gauge;
    while (state.isSleeping) {
      state = sleepStep(state);
    }
    expect(state.markers.length).toBeGreaterThan(0);
    expect(state.gauge - before).toBeCloseTo(sleepGauge(short));
    expect(sleepGauge(short)).toBeLessThan(sleepGauge(full));
  });

  it('4 h ne vident aucun marqueur mais prennent un pas de temps', () => {
    const short = sleepingFor(full, 4);
    let state = fallAsleep({ ...short, gauge: bedtimeGauge(short) });
    expect(state.sleepTotal).toBe(1);
    state = sleepStep(state);
    expect(state.isSleeping).toBe(false);
    expect(state.markers).toEqual(full.markers);
    expect(state.stats).toEqual(full.stats);
  });

  it('prend du temps même sans marqueur à vider', () => {
    let state = fallAsleep(bedtime);
    const before = state.gauge;
    while (state.isSleeping) {
      state = sleepStep(state);
    }
    // Le sommeil traverse la fin de la période : la jauge repart de zéro.
    expect(state.period).toBe(1);
    expect(state.gauge + startState.gaugeCapacity - before).toBeCloseTo(
      sleepGauge(startState),
    );
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
  it('répartit une demi-seconde sur les pas', () => {
    expect(sleepStepMs(asleep) * asleep.sleepTotal).toBe(500);
    expect(sleepStepMs({ ...asleep, sleepTotal: 10 })).toBe(50);
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
    expect(wagesDueOf(next)).toBeGreaterThan(0);
  });

  it('garde la file tant que le personnage dort', () => {
    const queued = { ...asleep, queuedActions: [work] };
    const next = settleSleep(queued);
    expect(next.isSleeping).toBe(true);
    expect(next.queuedActions).toEqual([work]);
    expect(next.money).toBe(0);
  });
});
