import { catchUp } from '@game/automation';
import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { simulatorConfig } from './config';
import { formatCsv, formatReport } from './report';
import { simulateLife } from './simulate';
import { chooseAction } from './strategy';

// Une seule vie simulée pour tous les tests (déterministe, environ 1 s).
const result = simulateLife();

describe('simulateLife', () => {
  it('joue une vie complète jusqu’à la mort', () => {
    expect(result.endedBy).toBe('death');
    expect(result.finalState.status).toBe('dead');
    expect(result.curve.at(0)?.age).toBe(18);
    expect(result.curve.at(-1)?.age).toBe(75);
  });

  it('est déterministe', () => {
    const again = simulateLife();
    expect(again.activeMs).toBe(result.activeMs);
    expect(again.milestones).toEqual(result.milestones);
    expect(again.finalState).toEqual(result.finalState);
  });

  it('produit une courbe par période et des jalons dans l’ordre du temps', () => {
    expect(result.curve.length).toBe(result.finalState.period + 1);
    const times = result.milestones.map((milestone) => milestone.minutes);
    expect(times).toEqual(times.toSorted((first, second) => first - second));
    expect(result.milestones.map((milestone) => milestone.id)).toContain(
      'company',
    );
  });

  it('lâche la souris une fois le travail automatique actif (ADR 0005)', () => {
    const auto = result.milestones.find((entry) => entry.id === 'autoWork');
    expect(auto).toBeDefined();
    expect(result.clicksAfterAutoWork).toBe(0);
    // L'attente des automatismes ne compte pas comme du jeu actif.
    expect(result.waitMs).toBeGreaterThan(0);
    expect(result.elapsedMs).toBeGreaterThan(result.activeMs);
  });

  it('atteint chaque phase de vie', () => {
    expect(result.phasesReached).toEqual([
      'youngAdult',
      'entrepreneur',
      'boss',
      'senior',
    ]);
  });

  // Critères de fin de la v1 (docs/game/v1.md § 10), équilibrés en V1-24
  // (docs/game/equilibrage.md).
  it('dure entre 30 et 60 minutes de jeu actif', () => {
    expect(result.activeMs).toBeGreaterThanOrEqual(simulatorConfig.targetMinMs);
    expect(result.activeMs).toBeLessThanOrEqual(simulatorConfig.targetMaxMs);
  });

  it('n’a pas de zone morte de plus d’une minute', () => {
    expect(result.longestGapMs).toBeLessThanOrEqual(
      simulatorConfig.maxDeadZoneMs,
    );
    expect(result.deadZones).toEqual([]);
  });

  it('active le travail automatique à mi-vie (ADR 0005)', () => {
    const auto = result.milestones.find((entry) => entry.id === 'autoWork');
    expect(auto?.age).toBeGreaterThanOrEqual(35);
    expect(auto?.age).toBeLessThanOrEqual(45);
  });

  it('laisse mourir pendant une nuit d’absence si l’auto reste actif', () => {
    const { autoWorkState } = result;
    expect(autoWorkState).not.toBeNull();
    if (autoWorkState === null) {
      return;
    }
    const night = catchUp(autoWorkState, 8 * 60 * 60 * 1000);
    expect(night.summary.died).toBe(true);
    // Une courte absence ne tue pas.
    const coffee = catchUp(autoWorkState, 10 * 60 * 1000);
    expect(coffee.summary.died).toBe(false);
  });
});

describe('chooseAction', () => {
  const rich: GameState = { ...startState, money: 100_000 };

  it('travaille au départ', () => {
    expect(chooseAction(startState)).toEqual({ type: 'work', target: 'job' });
  });

  it('achète la première formation dès qu’il peut', () => {
    const cheap: GameState = {
      ...startState,
      money: 150,
      upgrades: ['cartes-visite'],
    };
    expect(chooseAction(cheap)).toEqual({
      type: 'buyUpgrade',
      id: 'stage-posture',
    });
  });

  it('attend pendant le sommeil', () => {
    const asleep: GameState = {
      ...startState,
      isSleeping: true,
      markers: ['metier', 'metier', 'metier', 'metier', 'metier'],
    };
    expect(chooseAction(asleep)).toBeUndefined();
  });

  it('active l’automatisation dès qu’elle est possible', () => {
    const owner: GameState = { ...rich, upgrades: ['procedure-travail'] };
    expect(chooseAction(owner)).toEqual({
      type: 'setAuto',
      action: 'work',
      isEnabled: true,
    });
  });

  it('étudie la stat qui bloque le prochain achat', () => {
    const student: GameState = {
      ...startState,
      money: 100,
      upgrades: ['cartes-visite', 'stage-posture'],
    };
    expect(chooseAction(student)).toEqual({
      type: 'study',
      courseId: 'metier',
    });
  });

  it('vend le surplus quand le stock est plein et sans commerce', () => {
    const stocked: GameState = {
      ...startState,
      companies: { atelier: 1 },
      stock: 50,
    };
    expect(chooseAction(stocked)).toEqual({ type: 'sellSurplus' });
  });
});

describe('rapport', () => {
  it('résume la vie en console', () => {
    const text = formatReport(result);
    expect(text).toContain('Durée de jeu actif estimée');
    expect(text).toContain('Plus longue zone morte');
    expect(text).toContain('Première entreprise');
    expect(text).toContain(' 75 |');
  });

  it('exporte la courbe en CSV, une ligne par période', () => {
    const lines = formatCsv(result).split('\n');
    expect(lines[0]).toBe(
      'period,age,minutes,money,stock,reputation,companies,upgrades,revenue',
    );
    expect(lines).toHaveLength(result.curve.length + 1);
  });
});
