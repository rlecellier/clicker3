import { events, placements, startState } from '@game/data';
import { fixedExpensesOf } from '@game/economy';
import { triggerEvents } from '@game/events';
import { addGauge, endPeriod, periodOutlook } from '@game/period';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';
import {
  capitalOf,
  ceilingOf,
  deposit,
  depositable,
  expectedYield,
  isPlacementUnlocked,
  rateOf,
  withdraw,
} from './placements';

const savings = placements[0];
const stocks = placements[1];
if (savings?.id !== 'savings' || stocks?.id !== 'stocks') {
  throw new Error('placements introuvables');
}

// Acteur majeur (palier 2) : épargne et titres débloqués.
const rich: GameState = {
  ...startState,
  money: 10_000,
  reputationEarned: 100,
  rent: 0,
};

describe('déblocage et plafond', () => {
  it('verrouille les placements au départ', () => {
    expect(isPlacementUnlocked(startState, 'savings')).toBe(false);
    expect(ceilingOf(startState, 'savings')).toBe(0);
    expect(depositable({ ...startState, money: 999 }, 'savings')).toBe(0);
  });

  it('débloque l’épargne au palier 1 et les titres au palier 2', () => {
    const tier1 = { ...startState, reputationEarned: 6 };
    expect(isPlacementUnlocked(tier1, 'savings')).toBe(true);
    expect(isPlacementUnlocked(tier1, 'stocks')).toBe(false);
    expect(isPlacementUnlocked(rich, 'stocks')).toBe(true);
  });

  it('monte le plafond avec les paliers, sans le dépasser au dernier', () => {
    expect(ceilingOf({ ...startState, reputationEarned: 6 }, 'savings')).toBe(
      savings.ceilings[0],
    );
    expect(ceilingOf(rich, 'savings')).toBe(savings.ceilings[1]);
    expect(ceilingOf({ ...startState, reputationEarned: 170 }, 'savings')).toBe(
      savings.ceilings[2],
    );
    expect(ceilingOf({ ...startState, reputationEarned: 170 }, 'stocks')).toBe(
      stocks.ceilings[1],
    );
  });
});

describe('déposer et retirer', () => {
  it('déplace l’argent du compte courant vers le placement', () => {
    const next = deposit(rich, 'savings', 4000);
    expect(next.money).toBe(6000);
    expect(next.placements.savings).toBe(4000);
    expect(capitalOf(next)).toBe(4000);
  });

  it('limite le dépôt à l’argent disponible et au plafond', () => {
    expect(deposit({ ...rich, money: 100 }, 'savings', 5000).money).toBe(0);
    const capped = deposit({ ...rich, money: 1_000_000 }, 'savings', 1_000_000);
    expect(capped.placements.savings).toBe(ceilingOf(rich, 'savings'));
  });

  it('ne dépose rien d’un placement verrouillé, d’un montant nul ou d’une dette', () => {
    expect(deposit(startState, 'savings', 100)).toBe(startState);
    expect(deposit(rich, 'savings', 0)).toBe(rich);
    expect(deposit({ ...rich, money: -50 }, 'savings', 100).placements).toEqual(
      startState.placements,
    );
  });

  it('retire à tout moment, au plus le capital placé', () => {
    const placed = deposit(rich, 'stocks', 3000);
    const back = withdraw(placed, 'stocks', 99_999);
    expect(back.money).toBe(rich.money);
    expect(back.placements.stocks).toBe(0);
    expect(withdraw(rich, 'stocks', 10)).toBe(rich);
  });

  it('ne mute pas l’état', () => {
    const frozen = deepFreeze(structuredClone(rich));
    expect(() => deposit(frozen, 'savings', 100)).not.toThrow();
  });
});

describe('rendement par période', () => {
  const base = { ...rich, jobId: null };
  const fixed = fixedExpensesOf(base);

  it('verse le rendement de chaque placement sur le compte courant', () => {
    const placed = {
      ...base,
      placements: { savings: 4000, stocks: 10_000 },
    };
    const next = endPeriod(placed);
    const expected =
      Math.round(4000 * savings.rate) + Math.round(10_000 * stocks.rate);
    expect(next.money).toBe(placed.money - fixed + expected);
    expect(next.placements).toEqual(placed.placements);
    expect(next.ledger.total.yields).toBe(expected);
  });

  it('est compté dans la balance prévue', () => {
    const placed = { ...base, placements: { savings: 4000, stocks: 0 } };
    expect(periodOutlook(placed).money).toBe(
      Math.round(4000 * savings.rate) - fixed,
    );
  });

  it('s’applique aux périodes simulées hors ligne', () => {
    const placed = { ...base, placements: { savings: 4000, stocks: 0 } };
    const away = addGauge(placed, placed.gaugeCapacity * 3, 'work');
    expect(away.period).toBe(3);
    expect(away.ledger.total.yields).toBe(3 * Math.round(4000 * savings.rate));
  });

  it('annonce le rendement de la prochaine période, celui que la clôture verse', () => {
    const placed = {
      ...base,
      placements: { savings: 4000, stocks: 10_000 },
    };
    const announced = expectedYield(placed);
    expect(announced).toBe(
      Math.round(4000 * savings.rate) + Math.round(10_000 * stocks.rate),
    );
    expect(endPeriod(placed).ledger.total.yields).toBe(announced);
    expect(expectedYield(base)).toBe(0);
  });

  it('ne rapporte rien sans capital placé', () => {
    expect(endPeriod(base).ledger.total.yields).toBe(0);
  });
});

describe('événements', () => {
  const placed = { ...rich, placements: { savings: 0, stocks: 10_000 } };

  it('la bulle fait monter le rendement des titres, le krach le fait chuter', () => {
    const bubble = triggerEvents({ ...placed, period: 14 });
    expect(rateOf(bubble, stocks)).toBeGreaterThan(stocks.rate);
    const crash = triggerEvents({ ...bubble, period: 33 });
    expect(rateOf(crash, stocks)).toBeLessThan(0);
    expect(rateOf(crash, savings)).toBe(savings.rate);
  });

  it('un rendement négatif retire du capital sans toucher à l’argent', () => {
    const crash = triggerEvents({ ...placed, period: 33 });
    const next = endPeriod({ ...crash, jobId: null });
    const loss = Math.round(10_000 * rateOf(crash, stocks));
    expect(next.placements.stocks).toBe(10_000 + loss);
    expect(next.ledger.total.yields).toBe(0);
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

describe('dépenser un placement', () => {
  it('reprend l’épargne puis les titres pour couvrir les dépenses', () => {
    const state: GameState = {
      ...startState,
      jobId: null,
      money: 0,
      placements: { savings: 100, stocks: 5000 },
    };
    const due = fixedExpensesOf(state);
    const next = endPeriod(state);
    expect(next.lastStatement?.unpaid).toBe(false);
    expect(next.placements.savings).toBe(0);
    expect(next.placements.stocks).toBeLessThan(5000);
    expect(next.money).toBeGreaterThanOrEqual(0);
    expect(due).toBeGreaterThan(100);
  });

  it('ne touche pas aux placements quand l’argent suffit', () => {
    const state: GameState = {
      ...startState,
      jobId: null,
      money: 100_000,
      placements: { savings: 100, stocks: 0 },
    };
    expect(endPeriod(state).placements.savings).toBe(100);
  });
});
