import { actionRules, startState } from '@game/data';
import { sleep } from '@game/sleep';
import type { GameState } from '@game/state';
import { study } from '@game/study';
import { buyBoost, canBuyBoost, isBoostActive } from './boosts';

const rich: GameState = {
  ...startState,
  money: 100_000,
  stats: { metier: 0, gestion: 0, intelligence: 700, endurance: 700 },
};

describe('buyBoost', () => {
  it('paie le prix et pose un effet temporaire', () => {
    const next = buyBoost(rich, 'cure-ginkgo');
    expect(next.money).toBe(rich.money - 20);
    expect(next.activeEffects).toEqual([
      { eventId: 'cure-ginkgo', kind: 'markerChance', value: 0.1, until: 3 },
    ]);
    expect(next.ledger.current.purchasesBy['cure-ginkgo']).toBe(20);
    expect(isBoostActive(next, 'cure-ginkgo')).toBe(true);
  });

  it('refuse sans le niveau de stat, sans argent ou pendant la durée', () => {
    expect(
      canBuyBoost({ ...rich, stats: startState.stats }, 'cure-ginkgo'),
    ).toBe(false);
    expect(canBuyBoost({ ...rich, money: 5 }, 'cure-ginkgo')).toBe(false);
    const active = buyBoost(rich, 'cure-ginkgo');
    expect(buyBoost(active, 'cure-ginkgo')).toBe(active);
    expect(buyBoost(rich, 'inconnu')).toBe(rich);
  });

  it('se rachète une fois l’effet écoulé', () => {
    const active = buyBoost(rich, 'cure-ginkgo');
    expect(canBuyBoost({ ...active, period: 3 }, 'cure-ginkgo')).toBe(true);
    expect(isBoostActive({ ...active, period: 3 }, 'cure-ginkgo')).toBe(false);
  });
});

describe('effets des coups de pouce', () => {
  it('la clinique double la conversion du sommeil', () => {
    const asleep: GameState = {
      ...buyBoost(rich, 'clinique-sommeil'),
      markers: ['metier'],
    };
    expect(sleep(asleep).stats.metier).toBe(
      actionRules.sleep.pointsPerMarker * 2,
    );
  });

  it('le séminaire donne deux chances de marqueur par étude', () => {
    const trained: GameState = {
      ...buyBoost(rich, 'seminaire-intensif'),
      upgrades: ['stage-posture'],
      stats: { ...rich.stats, metier: 0 },
      maxMarkers: 100,
    };
    const count = (state: GameState) => {
      let current = state;
      for (let index = 0; index < 100; index++) {
        current = study({ ...current, gauge: 0 }, 'metier');
      }
      return current.markers.length;
    };
    const plain = count({ ...trained, activeEffects: [] });
    expect(count(trained)).toBeGreaterThan(plain + 10);
  });
});
