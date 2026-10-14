import { wagesDueOf } from '@game/economy';
import { autoIntervalMs } from '@game/automation';
import { actionRules, startState } from '@game/data';
import { gainReputation } from '@game/reputation';
import type { GameState } from '@game/state';
import type { GameAction } from './actions';
import { triggerEvents } from '@game/events';
import { newGame, reduce } from './reduce';

describe('reduce', () => {
  it('applique addGauge', () => {
    const next = reduce(startState, {
      type: 'addGauge',
      amount: startState.gaugeCapacity * 3 + 40,
      kind: 'work',
    });
    expect(next.period).toBe(3);
    expect(next.gauge).toBe(40);
  });

  it('applique readMail : les messages reçus passent en lus', () => {
    const state = { ...startState, mailReceived: 4 };
    const next = reduce(state, { type: 'readMail' });
    expect(next.mailRead).toBe(4);
  });

  it('laisse l’état d’origine intact', () => {
    const before = structuredClone(startState);
    reduce(startState, { type: 'addGauge', amount: 250, kind: 'work' });
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

  it('applique work, study et changeJob', () => {
    const worked = reduce(startState, { type: 'work', target: 'job' });
    expect(wagesDueOf(worked)).toBeGreaterThan(0);

    const studied = reduce(
      { ...worked, money: 100, upgrades: ['stage-posture'] },
      { type: 'study', courseId: 'metier' },
    );
    expect(studied.money).toBeLessThan(100);

    const promoted = reduce(
      { ...startState, stats: { ...startState.stats, metier: 10 } },
      { type: 'changeJob', id: 'polyvalent' },
    );
    expect(promoted.jobId).toBe('polyvalent');
  });

  it('applique buyCompany et sellSurplus', () => {
    const rich = {
      ...startState,
      money: 1_000_000,
      stockCapacity: 1_000_000,
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
      { type: 'addGauge', amount: 500, kind: 'work' },
      { type: 'unlockDistrict', id: 'hauts-fourneaux' },
      { type: 'work', target: 'job' },
      { type: 'study', courseId: 'metier' },
      { type: 'changeJob', id: 'polyvalent' },
      { type: 'buyCompany', id: 'atelier' },
      { type: 'sellSurplus' },
      { type: 'buyUpgrade', id: 'cartes-visite' },
      { type: 'cancelUpgrade', id: 'cartes-visite' },
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

  it('restart prend le premier emploi choisi parmi les emplois de départ', () => {
    expect(
      reduce(startState, { type: 'restart', jobId: 'interim' }).jobId,
    ).toBe('interim');
  });

  it('restart ignore un emploi qui n’est pas un emploi de départ', () => {
    const restarted = reduce(startState, {
      type: 'restart',
      jobId: 'transformation',
    });
    expect(restarted).toEqual(newGame());
    expect(restarted.jobId).toBe(startState.jobId);
  });

  it('annule une amélioration sans rembourser', () => {
    const bought = reduce(
      { ...startState, money: 1000 },
      { type: 'buyUpgrade', id: 'cartes-visite' },
    );
    const cancelled = reduce(bought, {
      type: 'cancelUpgrade',
      id: 'cartes-visite',
    });
    expect(cancelled.upgrades).toEqual([]);
    expect(cancelled.money).toBe(bought.money);
  });

  it('convertit les marqueurs quand un travail manuel termine la période', () => {
    const state: GameState = {
      ...startState,
      gauge: startState.gaugeCapacity - 1,
      markers: ['metier'],
    };
    const next = reduce(state, { type: 'work', target: 'job' });
    expect(next.period).toBe(1);
    expect(next.stats.metier).toBe(1);
    expect(next.markers).toEqual([]);
  });

  it('ne bloque jamais le travail ni l’étude : plus de pause de sommeil', () => {
    const state: GameState = {
      ...startState,
      upgrades: ['stage-posture'],
      money: 500,
    };
    const worked = reduce(state, { type: 'work', target: 'job' });
    const studied = reduce(worked, { type: 'study', courseId: 'metier' });
    expect(studied.gauge).toBe(
      actionRules.work.minutes + actionRules.study.minutes,
    );
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
      expect(wagesDueOf(ticked)).toBeGreaterThan(0);
    });

    it('n’avance pas sans interrupteur', () => {
      const next = reduce(owner, { type: 'autoTick', elapsedMs: 99_999 });
      expect(next.period).toBe(0);
      expect(next.gauge).toBe(0);
      expect(next.money).toBe(0);
    });
  });
});
