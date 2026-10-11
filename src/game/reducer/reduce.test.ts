import { autoIntervalMs } from '@game/automation';
import { startState } from '@game/data';
import { gainReputation } from '@game/reputation';
import type { GameState } from '@game/state';
import type { GameAction } from './actions';
import { triggerEvents } from '@game/events';
import { newGame, reduce } from './reduce';

describe('reduce', () => {
  it('applique addGauge', () => {
    const next = reduce(startState, { type: 'addGauge', amount: 250 });
    expect(next.period).toBe(2);
    expect(next.gauge).toBe(50);
  });

  it('laisse l’état d’origine intact', () => {
    const before = structuredClone(startState);
    reduce(startState, { type: 'addGauge', amount: 250 });
    expect(startState).toEqual(before);
  });

  it('applique unlockDistrict', () => {
    const state = gainReputation(startState, 12);
    const next = reduce(state, {
      type: 'unlockDistrict',
      id: 'hauts-fourneaux',
    });
    expect(next.districts).toContain('hauts-fourneaux');
  });

  it('ignore un unlockDistrict refusé', () => {
    const settled = newGame();
    const next = reduce(settled, {
      type: 'unlockDistrict',
      id: 'hauts-fourneaux',
    });
    expect(next).toBe(settled);
  });

  it('applique work, study, sleep et changeJob', () => {
    const worked = reduce(startState, { type: 'work', target: 'job' });
    expect(worked.money).toBeGreaterThan(0);

    const studied = reduce(
      { ...worked, upgrades: ['stage-posture'] },
      { type: 'study', courseId: 'metier' },
    );
    expect(studied.money).toBeLessThan(worked.money);

    const rested = reduce(
      { ...startState, markers: ['metier'] },
      { type: 'sleep' },
    );
    expect(rested.stats.metier).toBe(1);

    const promoted = reduce(
      { ...startState, stats: { ...startState.stats, metier: 10 } },
      { type: 'changeJob', id: 'polyvalent' },
    );
    expect(promoted.jobId).toBe('polyvalent');
  });

  it('applique buyCompany et sellSurplus', () => {
    const rich = {
      ...startState,
      money: 1000,
      stats: { ...startState.stats, gestion: 10 },
    };
    const bought = reduce(rich, { type: 'buyCompany', id: 'atelier' });
    expect(bought.companies).toEqual({ atelier: 1 });

    const sold = reduce({ ...startState, stock: 10 }, { type: 'sellSurplus' });
    expect(sold.stock).toBe(0);
    expect(sold.money).toBeGreaterThan(0);
  });

  it('applique buyUpgrade', () => {
    const next = reduce(
      { ...startState, money: 500 },
      { type: 'buyUpgrade', id: 'cartes-visite' },
    );
    expect(next.upgrades).toEqual(['cartes-visite']);
  });

  describe('après la mort', () => {
    // La mort est déjà passée dans le journal : plus rien ne doit bouger.
    const rich: GameState = triggerEvents({
      ...startState,
      status: 'dead',
      money: 1_000_000,
      stock: 10,
      markers: ['metier'],
      reputation: 100,
      reputationEarned: 100,
      stats: { metier: 100, gestion: 100, intelligence: 100, endurance: 100 },
      upgrades: ['stage-posture'],
    });
    const actions: GameAction[] = [
      { type: 'addGauge', amount: 500 },
      { type: 'unlockDistrict', id: 'hauts-fourneaux' },
      { type: 'work', target: 'job' },
      { type: 'study', courseId: 'metier' },
      { type: 'sleep' },
      { type: 'changeJob', id: 'polyvalent' },
      { type: 'buyCompany', id: 'atelier' },
      { type: 'sellSurplus' },
      { type: 'buyUpgrade', id: 'cartes-visite' },
    ];

    it.each(actions)('refuse $type', (action) => {
      expect(reduce(rich, action)).toBe(rich);
    });
  });

  it('rejoue la même vie avec restart', () => {
    const played = reduce(
      { ...startState, status: 'dead', money: 99, period: 684 },
      { type: 'restart' },
    );
    expect(played).toEqual(newGame());
    expect(played.money).toBe(startState.money);
    expect(played.period).toBe(0);
  });

  describe('automatisation', () => {
    const owner: GameState = {
      ...startState,
      upgrades: ['procedure-travail'],
    };

    it('active un interrupteur, puis fait agir le temps réel', () => {
      const on = reduce(owner, {
        type: 'setAuto',
        action: 'work',
        isEnabled: true,
      });
      expect(on.autoWork).toBe(true);
      const ticked = reduce(on, {
        type: 'autoTick',
        elapsedMs: autoIntervalMs,
      });
      expect(ticked.money).toBeGreaterThan(0);
    });

    it('n’avance pas sans interrupteur', () => {
      const next = reduce(owner, { type: 'autoTick', elapsedMs: 99_999 });
      expect(next.period).toBe(0);
      expect(next.gauge).toBe(0);
      expect(next.money).toBe(0);
    });
  });
});
