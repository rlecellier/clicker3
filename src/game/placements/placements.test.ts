import { events, placements, startState } from '@game/data';
import { fixedExpensesOf } from '@game/economy';
import { triggerEvents } from '@game/events';
import { addGauge, endPeriod, periodOutlook } from '@game/period';
import { afterAction } from '@game/afterAction';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';
import {
  bufferOf,
  capitalOf,
  ceilingOf,
  checkingOf,
  expectedYield,
  isPlacementUnlocked,
  rateOf,
  rebalance,
} from './placements';

const [savings, pel, stocks] = placements;
if (savings?.id !== 'savings' || pel?.id !== 'pel' || stocks?.id !== 'stocks') {
  throw new Error('placements introuvables');
}

// Marque (palier 3) : Livret A, PEL et compte-titres débloqués.
const rich: GameState = {
  ...startState,
  money: 0,
  reputationEarned: 200,
  rent: 0,
  jobId: null,
};
const buffer = bufferOf(rich);
const savingsCeiling = ceilingOf(rich, 'savings');
const pelCeiling = ceilingOf(rich, 'pel');

const unlocked = (reputationEarned: number) =>
  (['savings', 'pel', 'stocks'] as const).filter((id) =>
    isPlacementUnlocked({ ...startState, reputationEarned }, id),
  );

describe('déblocage et plafond', () => {
  it('verrouille les placements au départ', () => {
    expect(isPlacementUnlocked(startState, 'savings')).toBe(false);
    expect(ceilingOf(startState, 'savings')).toBe(0);
  });

  it('monte l’échelle avec les paliers : Livret A, PEL, compte-titres', () => {
    expect(unlocked(6)).toEqual(['savings']);
    expect(unlocked(100)).toEqual(['savings', 'pel']);
    expect(unlocked(170)).toEqual(['savings', 'pel', 'stocks']);
  });

  it('des rendements croissants, du plus sûr au plus risqué', () => {
    expect(savings.rate).toBeLessThan(pel.rate);
    expect(pel.rate).toBeLessThan(stocks.rate);
  });

  it('proportionne le plafond à la réputation gagnée', () => {
    expect(savingsCeiling).toBe(200 * savings.ceilingPerReputation);
    expect(ceilingOf(rich, 'stocks')).toBe(200 * stocks.ceilingPerReputation);
  });
});

describe('répartition automatique', () => {
  it('garde le compte courant au matelas : deux périodes de dépenses fixes', () => {
    expect(buffer).toBe(2 * fixedExpensesOf(rich));
    const next = rebalance({ ...rich, money: buffer });
    expect(capitalOf(next)).toBe(0);
    expect(checkingOf(next)).toBe(buffer);
  });

  it('place le surplus dans le premier compte qui a de la place', () => {
    const next = rebalance({ ...rich, money: buffer + 5000 });
    expect(next.placements).toEqual({ savings: 5000, pel: 0, stocks: 0 });
    expect(next.money).toBe(buffer + 5000);
    expect(checkingOf(next)).toBe(buffer);
  });

  it('déborde sur le compte suivant quand un plafond est atteint', () => {
    const next = rebalance({
      ...rich,
      money: buffer + savingsCeiling + pelCeiling + 100,
    });
    expect(next.placements).toEqual({
      savings: savingsCeiling,
      pel: pelCeiling,
      stocks: 100,
    });
  });

  it('laisse le surplus sur le compte courant quand tout est plein', () => {
    const full = rebalance({ ...rich, money: 10_000_000 });
    expect(capitalOf(full)).toBe(
      savingsCeiling + pelCeiling + ceilingOf(rich, 'stocks'),
    );
    expect(checkingOf(full)).toBe(10_000_000 - capitalOf(full));
  });

  it('n’ouvre pas un compte verrouillé', () => {
    const next = rebalance({
      ...startState,
      rent: 0,
      reputationEarned: 6,
      money: 100_000,
    });
    expect(next.placements.savings).toBe(600);
    expect(next.placements.pel).toBe(0);
  });

  it('une dépense puise d’abord dans le compte courant', () => {
    const placed = rebalance({ ...rich, money: buffer + 5000 });
    const spent = rebalance({ ...placed, money: placed.money - 300 });
    expect(spent.placements).toEqual(placed.placements);
    expect(checkingOf(spent)).toBe(buffer - 300);
  });

  it('puis dans le compte au rendement le plus faible', () => {
    const placed = rebalance({
      ...rich,
      money: buffer + savingsCeiling + 4000,
    });
    expect(placed.placements.pel).toBe(4000);
    const spent = rebalance({ ...placed, money: placed.money - buffer - 1000 });
    expect(spent.placements.savings).toBe(savingsCeiling - 1000);
    expect(spent.placements.pel).toBe(4000);
    expect(checkingOf(spent)).toBe(0);
  });

  it('un revenu remplit le compte courant avant les placements', () => {
    const placed = rebalance({ ...rich, money: buffer + 5000 });
    const spent = rebalance({ ...placed, money: placed.money - 300 });
    const earned = rebalance({ ...spent, money: spent.money + 100 });
    expect(earned.placements.savings).toBe(5000);
    expect(checkingOf(earned)).toBe(buffer - 200);
    const refilled = rebalance({ ...spent, money: spent.money + 1000 });
    expect(refilled.placements.savings).toBe(5700);
    expect(checkingOf(refilled)).toBe(buffer);
  });

  it('suit chaque action du jeu', () => {
    expect(
      afterAction({ ...rich, money: buffer + 800 }).placements.savings,
    ).toBe(800);
  });

  it('ne mute pas l’état', () => {
    const frozen = deepFreeze(structuredClone({ ...rich, money: buffer + 10 }));
    expect(() => rebalance(frozen)).not.toThrow();
  });
});

describe('rendement par période', () => {
  const placed = rebalance({
    ...rich,
    money: buffer + savingsCeiling + 10_000,
  });
  const expected =
    Math.round(savingsCeiling * savings.rate) + Math.round(10_000 * pel.rate);

  it('verse le rendement sur le compte courant, puis le place', () => {
    const next = endPeriod(placed);
    const fixed = fixedExpensesOf(placed);
    expect(next.ledger.total.yields).toBe(expected);
    expect(next.money).toBe(placed.money - fixed + expected);
    expect(capitalOf(next)).toBeGreaterThanOrEqual(capitalOf(placed));
  });

  it('est compté dans la balance prévue', () => {
    expect(periodOutlook(placed).money).toBe(
      expected - fixedExpensesOf(placed),
    );
  });

  it('s’applique aux périodes simulées hors ligne', () => {
    const away = addGauge(placed, placed.gaugeCapacity * 3, 'work');
    expect(away.period).toBe(3);
    expect(away.ledger.total.yields).toBeGreaterThanOrEqual(3 * expected);
  });

  it('annonce le rendement de la prochaine période, celui que la clôture verse', () => {
    expect(expectedYield(placed)).toBe(expected);
    expect(endPeriod(placed).ledger.total.yields).toBe(expected);
    expect(expectedYield(rich)).toBe(0);
  });

  it('ne rapporte rien sans capital placé', () => {
    expect(endPeriod({ ...rich, money: buffer }).ledger.total.yields).toBe(0);
  });
});

describe('événements', () => {
  const held = rebalance({
    ...rich,
    money: buffer + savingsCeiling + pelCeiling + 10_000,
  });

  it('la bulle fait monter le rendement des titres, le krach le fait chuter', () => {
    const bubble = triggerEvents({ ...held, period: 14 });
    expect(rateOf(bubble, stocks)).toBeGreaterThan(stocks.rate);
    const crash = triggerEvents({ ...bubble, period: 33 });
    expect(rateOf(crash, stocks)).toBeLessThan(0);
    expect(rateOf(crash, savings)).toBe(savings.rate);
  });

  it('un rendement négatif retire du capital et du solde total', () => {
    const crash = triggerEvents({ ...held, period: 33 });
    const loss = Math.round(10_000 * rateOf(crash, stocks));
    const next = endPeriod(crash);
    expect(next.placements.stocks).toBeLessThanOrEqual(10_000 + loss);
    expect(next.ledger.total.yields).toBeLessThan(
      Math.round(held.placements.savings * savings.rate) +
        Math.round(held.placements.pel * pel.rate) +
        1,
    );
  });

  it('les événements de rendement existent dans les données', () => {
    const ids = events
      .filter((event) =>
        event.effects?.some(
          (effect) =>
            effect.type === 'temporary' && effect.kind === 'stocksRate',
        ),
      )
      .map((event) => event.id);
    expect(ids).toEqual(['bulle-internet', 'krach', 'crise-financiere']);
  });
});

describe('dépenses de la période', () => {
  it('puisent dans les placements quand le compte courant ne suffit pas', () => {
    const state: GameState = {
      ...startState,
      jobId: null,
      reputationEarned: 200,
      money: 5000,
      placements: { savings: 5000, pel: 0, stocks: 0 },
    };
    const due = fixedExpensesOf(state);
    const next = endPeriod(state);
    expect(next.lastStatement?.unpaid).toBe(false);
    expect(next.money).toBe(5000 - due + next.ledger.total.yields);
    expect(capitalOf(next)).toBeLessThanOrEqual(next.money);
  });

  it('est un impayé quand le total de tous les comptes ne suffit pas', () => {
    const state: GameState = { ...startState, jobId: null, money: 10 };
    expect(endPeriod(state).lastStatement?.unpaid).toBe(true);
  });
});
