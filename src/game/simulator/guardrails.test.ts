import { upgrades } from '@game/data';
import type { Upgrade } from '@game/data';
import { newGame } from '@game/reducer';
import { knownGuardrailFailures } from './config';
import {
  boostCheck,
  degradations,
  formatGuardrails,
  measuresOf,
  runGuardrails,
  statsCheck,
  utilityCheck,
} from './guardrails';
import type { LifeMeasures } from './guardrails';
import { simulateLife } from './simulate';
import type { SimulationResult } from './simulate';
import { chooseAction } from './strategy';

const byName = (first: string, second: string) => first.localeCompare(second);

const reference: LifeMeasures = {
  autoWorkAge: 40,
  revenueAtSixty: 1_000_000,
  activeMinutes: 30,
};

const upgradeOf = (id: string): Upgrade => {
  const found = upgrades.find((upgrade) => upgrade.id === id);
  if (found === undefined) {
    throw new Error(id);
  }
  return found;
};

const resultWith = (patch: Partial<SimulationResult>): SimulationResult => ({
  ...simulateLife(newGame(), { excludedUpgrades: [] }),
  ...patch,
});

describe('test d’utilité', () => {
  it('mesure de combien la vie sans l’amélioration est dégradée', () => {
    expect(
      degradations(reference, {
        autoWorkAge: 42,
        revenueAtSixty: 900_000,
        activeMinutes: 33,
      }),
    ).toEqual({
      autoWorkAge: expect.closeTo(0.05),
      revenueAtSixty: expect.closeTo(0.1),
      activeMinutes: expect.closeTo(0.1),
    });
  });

  it('accepte une amélioration dont le retrait dégrade une mesure de 5 %', () => {
    const check = utilityCheck(upgradeOf('agenda-electronique'), reference, {
      ...reference,
      revenueAtSixty: 940_000,
    });
    expect(check.isOk).toBe(true);
  });

  it('refuse une amélioration inutile ou nuisible', () => {
    const useless = utilityCheck(upgradeOf('agenda-electronique'), reference, {
      ...reference,
      revenueAtSixty: 980_000,
    });
    const harmful = utilityCheck(upgradeOf('agenda-electronique'), reference, {
      autoWorkAge: 38,
      revenueAtSixty: 1_100_000,
      activeMinutes: 29,
    });
    expect(useless.isOk).toBe(false);
    expect(harmful.isOk).toBe(false);
  });

  it('compte un travail automatique jamais atteint comme une dégradation', () => {
    const check = utilityCheck(upgradeOf('agenda-electronique'), reference, {
      ...reference,
      autoWorkAge: Infinity,
    });
    expect(check.isOk).toBe(true);
    expect(check.detail).toContain('jamais');
  });

  it('n’achète pas l’amélioration exclue', () => {
    const rich = { ...newGame(), money: 1_000_000 };
    expect(chooseAction(rich)).toEqual(
      expect.objectContaining({ type: 'buyUpgrade' }),
    );
    const all = new Set(upgrades.map((upgrade) => upgrade.id));
    expect(chooseAction(rich, all)?.type).not.toBe('buyUpgrade');
  });
});

describe('part utile d’un boost', () => {
  const studio = upgradeOf('studio-renove');
  const boughtAfter = (statPoints: number) =>
    boostCheck(
      studio,
      resultWith({
        statPointsTotal: 100,
        upgradePurchases: [{ id: studio.id, minutes: 10, statPoints }],
      }),
    );

  it('exige la moitié des points de stat après l’achat', () => {
    expect(boughtAfter(50).isOk).toBe(true);
    expect(boughtAfter(51).isOk).toBe(false);
  });

  it('refuse un boost jamais acheté', () => {
    const check = boostCheck(
      studio,
      resultWith({ upgradePurchases: [], statPointsTotal: 100 }),
    );
    expect(check.isOk).toBe(false);
    expect(check.detail).toBe('jamais acheté');
  });
});

describe('stats vivantes', () => {
  it('exige un dernier palier atteint après la minute 25', () => {
    expect(
      statsCheck(resultWith({ statMaxMinutes: { metier: 5, endurance: 26 } }))
        .isOk,
    ).toBe(true);
    expect(
      statsCheck(resultWith({ statMaxMinutes: { metier: 5, endurance: 18 } }))
        .isOk,
    ).toBe(false);
    expect(statsCheck(resultWith({ statMaxMinutes: {} })).isOk).toBe(false);
  });
});

describe('simulation', () => {
  it('relève les achats et les points de stat de la vie', () => {
    const life = simulateLife();
    expect(life.upgradePurchases.length).toBe(life.finalState.upgrades.length);
    expect(life.statPointsTotal).toBeGreaterThan(0);
    const points = life.upgradePurchases.map((entry) => entry.statPoints);
    expect(points).toEqual(points.toSorted((first, second) => first - second));
    expect(measuresOf(life).autoWorkAge).toBeGreaterThan(18);
  });

  it('retire vraiment l’amélioration exclue', () => {
    const life = simulateLife(newGame(), {
      excludedUpgrades: ['agenda-electronique'],
    });
    expect(life.finalState.upgrades).not.toContain('agenda-electronique');
  });
});

describe('garde-fous sur les valeurs actuelles', () => {
  // Une vie de référence et une vie par amélioration retirée.
  it('échouent exactement pour les échecs connus', () => {
    const checks = runGuardrails();
    const failures = checks
      .filter((check) => !check.isOk)
      .map((check) => `${check.kind}:${check.subject}`);
    // Quand un chantier corrige un échec, il le retire de config.ts.
    expect(failures.toSorted(byName)).toEqual(
      [...knownGuardrailFailures].toSorted(byName),
    );
    expect(formatGuardrails(checks, knownGuardrailFailures)).toContain('CONNU');
    expect(formatGuardrails(checks, knownGuardrailFailures)).not.toContain(
      'ÉCHEC',
    );
  }, 120_000);
});
