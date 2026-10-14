import { companies, startState } from '@game/data';
import type { GameState } from '@game/state';
import { fixedExpensesOf } from '@game/economy';
import { ageOf } from '@game/time';
import { deepFreeze } from '@test/deepFreeze';
import { addGauge, endPeriod, periodOutlook } from './period';

const capacity = startState.gaugeCapacity;

// Débits lus dans les données : les tests suivent le recalage de l'équilibrage.
const workshop = companies.find((company) => company.id === 'atelier');
const shop = companies.find((company) => company.id === 'boutique');
const workshopOutput = workshop?.kind === 'production' ? workshop.output : 0;
const shopCapacity = shop?.kind === 'commerce' ? shop.capacity : 0;

describe('la nuit', () => {
  it('convertit tous les marqueurs en points de stat à la clôture', () => {
    const brain = {
      ...startState,
      markers: ['metier', 'gestion', 'metier'] as GameState['markers'],
    };
    const next = endPeriod(brain);
    expect(next.markers).toEqual([]);
    expect(next.lastNightMarkers).toBe(3);
    expect(next.stats.metier).toBe(2);
    expect(next.stats.gestion).toBe(1);
  });

  it('garde la capacité d’éveil tant que la tranche de vie ne change pas', () => {
    expect(endPeriod(startState).gaugeCapacity).toBe(960);
  });

  it('réduit l’éveil quand la vie passe à l’âge adulte (7 h de sommeil)', () => {
    const before = {
      ...startState,
      period: (30 - startState.life.startAge) * 12 - 1,
    };
    expect(endPeriod(before).gaugeCapacity).toBe((24 - 7) * 60);
  });
});

describe('addGauge', () => {
  it('remplit la jauge sans faire passer de période', () => {
    const next = addGauge(startState, 30, 'work');
    expect(next.gauge).toBe(30);
    expect(next.period).toBe(0);
  });

  it('fait passer une période quand la jauge déborde et garde le surplus', () => {
    const next = addGauge({ ...startState, gauge: capacity - 10 }, 25, 'work');
    expect(next.period).toBe(1);
    expect(next.gauge).toBe(15);
  });

  it('fait passer plusieurs périodes d’un coup', () => {
    const next = addGauge(startState, capacity * 3 + 10, 'work');
    expect(next.period).toBe(3);
    expect(next.gauge).toBe(10);
  });

  it('ignore une quantité nulle ou négative', () => {
    expect(addGauge(startState, 0, 'work')).toBe(startState);
    expect(addGauge(startState, -5, 'work')).toBe(startState);
  });

  it('refuse une capacité de jauge invalide', () => {
    expect(() =>
      addGauge({ ...startState, gaugeCapacity: 0 }, 1, 'work'),
    ).toThrow(RangeError);
  });

  it('fait vieillir d’un an après 12 périodes', () => {
    const next = addGauge(startState, capacity * 12, 'work');
    expect(ageOf(next)).toBe(19);
  });

  it('meurt à l’âge fixé dans les données et s’arrête là', () => {
    const lastPeriod = (75 - 18) * 12 - 1;
    // La capacité change avec la tranche de vie : on avance jusqu'à la dernière période.
    let before = startState;
    while (before.period < lastPeriod) {
      before = addGauge(before, before.gaugeCapacity, 'work');
    }
    expect(before.status).toBe('playing');

    const dead = addGauge(before, before.gaugeCapacity * 5, 'work');
    expect(dead.status).toBe('dead');
    expect(ageOf(dead)).toBe(75);
    expect(dead.period).toBe(lastPeriod + 1);
  });

  it('fait payer l’intérêt de la dette en fin de période', () => {
    const next = addGauge({ ...startState, money: -1000 }, capacity, 'work');
    // Loyer et train de vie prélevés, puis 1,5 % d’intérêt sur le solde.
    const balance = -1000 - fixedExpensesOf(startState);
    const interest = Math.ceil(-balance * 0.015);
    expect(next.money).toBe(balance - interest);
    expect(next.ledger.history[0]?.figures.interest).toBe(interest);
  });

  it('ne change plus rien une fois mort', () => {
    const dead = { ...startState, status: 'dead' as const };
    expect(addGauge(dead, capacity, 'work')).toBe(dead);
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(startState));
    expect(() => addGauge(frozen, capacity * 2, 'work')).not.toThrow();
    expect(frozen).toEqual(startState);
  });

  it('reste sérialisable', () => {
    const next = addGauge(startState, capacity * 5 + 7, 'work');
    // Le but du test est justement l'aller-retour JSON.
    // eslint-disable-next-line unicorn/prefer-structured-clone
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });
});

describe('periodOutlook', () => {
  it('compte le loyer et le train de vie à venir dans la balance', () => {
    const rich = { ...startState, money: 1000 };
    expect(periodOutlook(rich).money).toBe(-fixedExpensesOf(startState));
  });

  it('prévoit la variation d’argent et de stock de la clôture', () => {
    const state = {
      ...startState,
      money: 500,
      stock: shopCapacity,
      stockCapacity: 2 * shopCapacity,
      companies: { ...startState.companies, atelier: 1, boutique: 1 },
    };
    const outlook = periodOutlook(state);
    const end = endPeriod(state);
    expect(outlook.money).toBe(end.money - state.money);
    expect(outlook.stock).toBe(end.stock - state.stock);
  });

  it('reste négative à stock vide quand les ventes dépassent la production', () => {
    const state = {
      ...startState,
      stock: 0,
      // Assez de commerces pour vendre plus que la production.
      companies: { ...startState.companies, atelier: 1, boutique: 3 },
    };
    expect(endPeriod(state).stock).toBe(0);
    expect(periodOutlook(state).stock).toBe(workshopOutput - 3 * shopCapacity);
  });

  it('reste positive à stock plein quand la production dépasse les ventes', () => {
    const state = {
      ...startState,
      stock: startState.stockCapacity,
      companies: { ...startState.companies, atelier: 5 },
    };
    expect(endPeriod(state).stock).toBe(state.stockCapacity);
    expect(periodOutlook(state).stock).toBe(5 * workshopOutput);
  });

  it('ne recompte pas ce qui est déjà payé dans la période', () => {
    const state = {
      ...startState,
      money: 1000,
      ledger: {
        ...startState.ledger,
        current: { ...startState.ledger.current, purchases: 40 },
      },
    };
    expect(periodOutlook(state).money).toBe(-fixedExpensesOf(startState));
  });
});

describe('endPeriod', () => {
  it('avance d’une période et retire une capacité de jauge', () => {
    const next = endPeriod({ ...startState, gauge: capacity + 5 });
    expect(next.period).toBe(1);
    expect(next.gauge).toBe(5);
  });
});

describe('segments de la jauge', () => {
  const capacity = startState.gaugeCapacity;

  it('garde la nature de chaque part, fusionnée si consécutive', () => {
    let state = addGauge(startState, 10, 'study');
    state = addGauge(state, 5, 'study');
    state = addGauge(state, 20, 'work');
    state = addGauge(state, 3, 'work');
    expect(state.gaugeSegments).toEqual([
      { kind: 'study', amount: 15 },
      { kind: 'work', amount: 23 },
    ]);
  });

  it('au passage de période, retire le plus ancien et garde le surplus', () => {
    let state = addGauge(startState, capacity - 10, 'study');
    state = addGauge(state, 25, 'work');
    expect(state.gauge).toBe(15);
    expect(state.gaugeSegments).toEqual([{ kind: 'work', amount: 15 }]);
  });
});
