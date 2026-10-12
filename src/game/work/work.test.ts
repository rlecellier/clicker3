import { wagesDueOf } from '@game/economy';
import {
  actionRules,
  automationRules,
  courses,
  jobs,
  startState,
  upgrades,
} from '@game/data';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';
import { buyCompany } from '@game/companies';
import { endPeriod, periodOutlook } from '@game/period';
import { study } from '@game/study';
import { buyUpgrade } from '@game/upgrades';
import { jobWage, work } from './work';

const firstJob = jobs[0];

const salesUpgrade = upgrades.find((upgrade) =>
  upgrade.effects.some((effect) => effect.type === 'salesBonus'),
);

describe('jobWage et balance de la période', () => {
  const trading = {
    ...startState,
    money: 5000,
    stock: 4,
    companies: { ...startState.companies, atelier: 1, boutique: 1 },
  };

  // Ce que `work` verse vraiment sur un clic.
  const paid = (state: GameState, isAuto = false) =>
    wagesDueOf(work(state, 'job', isAuto)) - wagesDueOf(state);

  it('annonce ce que rapporte un clic', () => {
    expect(jobWage(startState)).toBe(paid(startState));
  });

  it('applique le malus de vieillesse et la moitié en automatique', () => {
    const senior = { ...startState, period: 12 * 42 };
    expect(jobWage(senior)).toBeLessThan(jobWage(startState));
    expect(jobWage(senior)).toBe(paid(senior));
    expect(jobWage(startState, true)).toBe(paid(startState, true));
    expect(jobWage(senior, true)).toBe(paid(senior, true));
  });

  it('vaut 0 sans emploi', () => {
    expect(jobWage({ ...startState, jobId: null })).toBe(0);
  });

  it('fait monter la balance exactement du salaire à chaque clic', () => {
    let state: GameState = trading;
    for (let click = 0; click < 3; click += 1) {
      const before = periodOutlook(state).money;
      const wage = jobWage(state);
      state = work(state);
      expect(state.period).toBe(0);
      expect(periodOutlook(state).money).toBe(before + wage);
    }
  });

  it('ne change pas l’argent avant la clôture', () => {
    expect(work(trading).money).toBe(trading.money);
  });

  it('étudier fait baisser l’argent tout de suite, pas la balance', () => {
    const state: GameState = {
      ...trading,
      upgrades: ['stage-posture'],
    };
    const studied = study(state, 'metier');
    expect(studied.period).toBe(0);
    expect(studied.money).toBeLessThan(state.money);
    expect(periodOutlook(studied).money).toBe(periodOutlook(state).money);
  });

  it('annonce la variation d’argent de la clôture, après avoir travaillé puis étudié', () => {
    let state: GameState = {
      ...startState,
      money: 100,
      upgrades: ['stage-posture'],
    };
    for (let click = 0; click < 6; click += 1) {
      state = work(state);
    }
    const announced = periodOutlook(state).money;
    expect(announced).toBeGreaterThan(0);
    const studied = study(state, 'metier');
    expect(studied.period).toBe(1);
    const course = courses.find((item) => item.id === 'metier');
    expect(studied.money).toBe(state.money - (course?.cost ?? 0) + announced);
  });

  const ready: GameState = {
    ...trading,
    money: 1_000_000,
    stock: 50,
    reputationEarned: 1000,
    stats: { ...startState.stats, gestion: 10 },
  };

  // Variation d'argent de la clôture, calculée par la clôture elle-même.
  const closingGap = (state: GameState) => endPeriod(state).money - state.money;

  it('annonce exactement la variation de la clôture avec production, vente, améliorations et travail', () => {
    // Ateliers, boutique, amélioration de ventes : après du travail à l'emploi,
    // la balance est ce que fait la clôture (stock ni vide ni plein).
    expect(salesUpgrade).toBeDefined();
    let state: GameState = buyUpgrade(
      { ...ready, stock: 20 },
      salesUpgrade?.id ?? '',
    );
    state = buyCompany(state, 'atelier');
    for (let click = 0; click < 4; click += 1) {
      state = work(state);
      const closed = endPeriod(state);
      const outlook = periodOutlook(state);
      expect(outlook.money).toBe(closed.money - state.money);
      expect(outlook.stock).toBe(closed.stock - state.stock);
    }
    expect(wagesDueOf(state)).toBeGreaterThan(0);
  });

  it('suit un achat qui change la production', () => {
    const bought = buyCompany(ready, 'atelier');
    expect(bought.companies.atelier).toBe(2);
    expect(periodOutlook(bought).stock).toBeGreaterThan(
      periodOutlook(ready).stock,
    );
    expect(periodOutlook(bought).money).toBe(closingGap(bought));
  });

  it('suit une amélioration qui change les ventes', () => {
    expect(salesUpgrade).toBeDefined();
    const id = salesUpgrade?.id ?? '';
    const price = salesUpgrade?.price ?? 0;
    const before = periodOutlook(ready).money;
    const bought = buyUpgrade(ready, id);
    expect(bought.upgrades).toContain(id);
    expect(periodOutlook(bought).money).toBe(closingGap(bought));
    expect(periodOutlook(bought).money).toBeGreaterThan(before - price);
  });
});

describe('work', () => {
  it('verse le salaire et un peu de réputation', () => {
    const next = work(startState);
    expect(wagesDueOf(next)).toBe(firstJob?.salary);
    expect(next.reputation).toBeCloseTo(firstJob?.reputation ?? 0);
    expect(next.reputationEarned).toBeCloseTo(firstJob?.reputation ?? 0);
  });

  it('applique le multiplicateur de réputation de l’emploi', () => {
    const boosted = work({ ...startState, workReputationMultiplier: 2 });
    expect(boosted.reputation).toBeCloseTo((firstJob?.reputation ?? 0) * 2);
  });

  it('remplit la jauge du coût de l’action', () => {
    expect(work(startState).gauge).toBe(actionRules.work.gauge);
  });

  it('peut terminer la période', () => {
    const almostFull = { ...startState, gauge: startState.gaugeCapacity - 1 };
    const next = work(almostFull);
    expect(next.period).toBe(1);
    expect(next.gauge).toBe(actionRules.work.gauge - 1);
  });

  it('donne des marqueurs de Métier, sans dépasser le maximum', () => {
    let state = startState;
    const seen = new Set<number>();
    for (let index = 0; index < 200; index++) {
      state = work({ ...state, gauge: 0, status: 'playing' });
      seen.add(state.markers.length);
    }
    expect(state.markers.length).toBeLessThanOrEqual(state.maxMarkers);
    expect(state.markers.length).toBe(state.maxMarkers);
    expect(new Set(state.markers)).toEqual(new Set(['metier']));
  });

  it('est déterministe pour une graine donnée', () => {
    expect(work(startState)).toEqual(work(startState));
  });

  it('refuse de travailler quand le personnage est mort', () => {
    const dead = { ...startState, status: 'dead' as const };
    expect(work(dead)).toBe(dead);
  });

  it('refuse une entreprise qu’on ne possède pas', () => {
    expect(work(startState, 'atelier')).toBe(startState);
    expect(work(startState, 'nulle-part')).toBe(startState);
  });

  it('travailler dans une entreprise donne un bonus de période, pas de salaire', () => {
    const owner = { ...startState, companies: { atelier: 1 } };
    const next = work(owner, 'atelier');
    expect(next.workBoosts).toEqual({ atelier: 1 });
    expect(next.money).toBe(0);
    expect(next.reputation).toBe(0);
    expect(next.gauge).toBe(actionRules.work.gauge);
  });

  it('travailler dans une entreprise donne des marqueurs de Gestion', () => {
    let state: GameState = { ...startState, companies: { atelier: 1 } };
    for (let index = 0; index < 100; index++) {
      state = work({ ...state, gauge: 0 }, 'atelier');
    }
    expect(state.markers.length).toBeGreaterThan(0);
    expect(new Set(state.markers)).toEqual(new Set(['gestion']));
  });

  it('refuse sans emploi', () => {
    const jobless = { ...startState, jobId: null };
    expect(work(jobless)).toBe(jobless);
  });

  describe('action automatique', () => {
    const senior = { ...startState, period: 12 * 42 };

    it('rapporte moitié moins qu’une action manuelle', () => {
      const manual = work(startState);
      const auto = work(startState, 'job', true);
      expect(wagesDueOf(auto)).toBe(
        Math.round(wagesDueOf(manual) * automationRules.yieldFactor),
      );
      expect(auto.reputation).toBeCloseTo(
        manual.reputation * automationRules.yieldFactor,
      );
    });

    it('subit le malus de vieillesse en manuel, pas en automatique', () => {
      expect(wagesDueOf(work(senior))).toBe(
        Math.round((firstJob?.salary ?? 0) * actionRules.senior.manualFactor),
      );
      expect(wagesDueOf(work(senior, 'job', true))).toBe(
        wagesDueOf(work(startState, 'job', true)),
      );
    });

    it('donne le même bonus d’entreprise à 18 ans et à la vieillesse', () => {
      const owner = { ...startState, companies: { atelier: 1 } };
      const old = { ...senior, companies: { atelier: 1 } };
      expect(work(old, 'atelier', true).workBoosts).toEqual(
        work(owner, 'atelier', true).workBoosts,
      );
    });
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(startState));
    expect(() => work(frozen)).not.toThrow();
  });
});
