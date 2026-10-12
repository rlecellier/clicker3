import { withModifiers } from '@game/upgrades';
import { events, journalLimit, startState } from '@game/data';
import { endPeriod } from '@game/period';
import type { GameState } from '@game/state';
import { activeBonus } from '@game/effects';
import { deepFreeze } from '@test/deepFreeze';
import { eventById, fireEvent, triggerEvents } from './events';

const stateAt = (period: number, changes: Partial<GameState> = {}) => ({
  ...startState,
  period,
  ...changes,
});

const ids = (state: GameState) => state.events.map((entry) => entry.id);

const fastForward = (state: GameState, periods: number) => {
  let current = state;
  for (let index = 0; index < periods; index++) {
    current = endPeriod({ ...current, gauge: current.gaugeCapacity });
  }
  return current;
};

describe('intégrité des données', () => {
  it('a des ids uniques et un texte pour chaque événement', () => {
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
    for (const event of events) {
      expect(event.text.length).toBeGreaterThan(10);
    }
  });

  it('compte 10 événements du monde, 5 de vie et des événements d’état', () => {
    const world = events.filter((event) => event.trigger?.type === 'period');
    const life = events.filter((event) => event.trigger?.type === 'age');
    expect(world).toHaveLength(10);
    expect(life).toHaveLength(5);
    expect(events.length - world.length - life.length).toBeGreaterThanOrEqual(
      14,
    );
  });

  it('fournit les événements « retour après absence » et « mort »', () => {
    expect(eventById('retour-absence')?.trigger).toBeUndefined();
    expect(eventById('mort')?.trigger).toEqual({ type: 'dead' });
  });
});

describe('triggerEvents', () => {
  it('fait survenir les événements du départ, dans l’ordre des données', () => {
    const next = triggerEvents(startState);
    expect(ids(next)).toEqual(['euro', 'age-18']);
    expect(next.events[0]?.period).toBe(0);
    expect(next.events[0]?.text).toContain("Bienvenue dans l'euro");
  });

  it('déclenche un événement du monde à la bonne période, pas avant', () => {
    const before = triggerEvents(stateAt(10));
    expect(ids(before)).not.toContain('bug-an-2000');
    const at = triggerEvents(stateAt(11));
    expect(ids(at)).toContain('bug-an-2000');
  });

  it('déclenche un événement d’âge', () => {
    const next = triggerEvents(stateAt(12 * 12));
    expect(ids(next)).toContain('age-30');
    expect(ids(next)).not.toContain('age-40');
  });

  it('déclenche un événement d’état (palier de réputation, quartier)', () => {
    const next = triggerEvents({
      ...startState,
      reputationEarned: 10,
      districts: ['tilleuls', 'hauts-fourneaux'],
    });
    expect(ids(next)).toContain('reputation-1');
    expect(ids(next)).toContain('quartier-hauts-fourneaux');
  });

  it('ne déclenche un événement unique qu’une fois', () => {
    const once = triggerEvents(startState);
    const twice = triggerEvents(once);
    expect(twice).toBe(once);
    expect(once.firedEvents).toContain('euro');
  });

  it('rattrape un événement dont la période est passée', () => {
    const next = triggerEvents(stateAt(40));
    expect(ids(next)).toEqual(
      expect.arrayContaining(['bug-an-2000', 'bulle-internet', 'krach']),
    );
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(startState));
    expect(() => triggerEvents(frozen)).not.toThrow();
  });

  it('garde un journal sérialisable et borné', () => {
    const next = triggerEvents(stateAt(40));
    // eslint-disable-next-line unicorn/prefer-structured-clone
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);

    let long = next;
    for (let index = 0; index < journalLimit + 50; index++) {
      long = fireEvent(long, events[0] ?? ({} as never));
    }
    expect(long.events).toHaveLength(journalLimit);
  });
});

describe('événements répétables', () => {
  const rentPaid = { id: 'loyer' };

  it('surviennent à chaque période où la condition est vraie', () => {
    const state = triggerEvents(startState);
    const after = fastForward({ ...state, money: 10_000 }, 3);
    const rents = after.events.filter((entry) => entry.id === rentPaid.id);
    expect(rents.map((entry) => entry.period)).toEqual([1, 2, 3]);
  });

  it('ne se répètent pas deux fois dans la même période', () => {
    const state = fastForward({ ...triggerEvents(startState), money: 500 }, 1);
    const again = triggerEvents(state);
    expect(again).toBe(state);
  });

  it('signalent l’impayé et la rupture de stock', () => {
    const unpaid = fastForward(triggerEvents(startState), 1);
    expect(ids(unpaid)).toContain('impaye');

    const starved = fastForward(
      {
        ...triggerEvents(startState),
        money: 10_000,
        companies: { boutique: 1 },
      },
      1,
    );
    expect(ids(starved)).toContain('rupture-stock');
  });

  it('signalent le stock plein', () => {
    const next = fastForward(
      {
        ...triggerEvents(startState),
        money: 10_000,
        companies: { atelier: 40 },
      },
      1,
    );
    expect(ids(next)).toContain('stock-plein');
  });
});

describe('effets', () => {
  it('dépense unique d’un mois de loyer (bug de l’an 2000)', () => {
    const next = triggerEvents(stateAt(11, { money: 1000 }));
    expect(next.money).toBe(1000 - startState.rent);
  });

  it('laisse l’argent passer sous 0 (dette)', () => {
    expect(triggerEvents(stateAt(11, { money: 10 })).money).toBe(
      10 - startState.rent,
    );
  });

  it('ne réduit pas une dette avec un facteur sur l’argent (crise)', () => {
    const firedEvents = events
      .map((event) => event.id)
      .filter((id) => id !== 'crise-financiere');
    const crisis = (money: number) =>
      triggerEvents(stateAt(116, { money, firedEvents })).money;
    expect(crisis(-1000)).toBe(-1000);
    expect(crisis(1000)).toBe(900);
  });

  it('augmente le loyer (euro fiduciaire)', () => {
    const next = triggerEvents(stateAt(36));
    expect(next.rent).toBeGreaterThan(startState.rent);
  });

  it('retire de la réputation sans passer sous 0 (krach)', () => {
    expect(triggerEvents(stateAt(33, { reputation: 5 })).reputation).toBe(4);
    expect(triggerEvents(stateAt(33, { reputation: 0 })).reputation).toBe(0);
  });

  it('applique un effet temporaire puis le laisse expirer (bulle internet)', () => {
    const during = triggerEvents(stateAt(14));
    expect(activeBonus(during, 'sales')).toBeCloseTo(0.2);
    expect(during.activeEffects[0]?.eventId).toBe('bulle-internet');

    const after = triggerEvents({ ...during, period: 33 });
    expect(activeBonus(after, 'sales')).toBe(0);
    expect(after.activeEffects).toEqual([]);
  });

  it('n’ajoute pas un effet temporaire déjà échu', () => {
    const late = triggerEvents(stateAt(300));
    expect(late.activeEffects.some((effect) => effect.until <= 300)).toBe(
      false,
    );
  });

  it('ralentit le travail un temps (confinement)', () => {
    const next = triggerEvents(stateAt(254));
    expect(activeBonus(next, 'workSlow')).toBe(0.5);
  });

  it('baisse le salaire des emplois 1 et 2 (intelligence artificielle)', () => {
    const next = triggerEvents(stateAt(372));
    expect(next.jobSalaryFactors['interim']).toBeCloseTo(0.8);
    expect(next.jobSalaryFactors['polyvalent']).toBeCloseTo(0.8);
  });

  it('augmente loyer et salaires, réduit l’argent (crise financière)', () => {
    const withEmployee = withModifiers(
      stateAt(116, { money: 1000, upgrades: ['premier-collaborateur'] }),
    );
    const next = triggerEvents(withEmployee);
    // L'euro fiduciaire (+5 %, période 36) survient en même temps.
    expect(next.rentFactor).toBeCloseTo(1.05 * 1.1);
    expect(next.rent).toBe(Math.round(startState.rent * 1.05 * 1.1));
    expect(next.payrollFactor).toBeCloseTo(1.1);
    expect(next.payroll).toBe(Math.round(withEmployee.payroll * 1.1));
    expect(next.money).toBeLessThan(1000);
  });
});

describe('mort et bilan', () => {
  it('écrit le bilan avec les entreprises possédées', () => {
    const next = triggerEvents({
      ...startState,
      status: 'dead',
      companies: { atelier: 2, boutique: 2 },
    });
    const death = next.events.find((entry) => entry.id === 'mort');
    expect(death?.text).toContain('Bilan : 4 entreprises, 0 week-end.');
  });

  it('survient quand le personnage meurt à la fin de sa vie', () => {
    const lastPeriod = (75 - 18) * 12 - 1;
    const state = triggerEvents({ ...startState, period: lastPeriod });
    const dead = endPeriod({ ...state, gauge: state.gaugeCapacity });
    expect(dead.status).toBe('dead');
    expect(ids(dead)).toContain('mort');
  });
});

describe('fireEvent', () => {
  it('fait survenir un événement manuel (retour après absence)', () => {
    const event = eventById('retour-absence');
    expect(event).toBeDefined();
    const next = fireEvent(startState, event as NonNullable<typeof event>);
    expect(ids(next)).toEqual(['retour-absence']);
    expect(next.firedEvents).toEqual([]);
  });
});
