import {
  companies,
  courses,
  districts,
  startState,
  upgrades,
} from '@game/data';
import { isUnlocked } from '@game/requirements';
import type { Requirement } from '@game/requirements';
import type { GameState } from '@game/state';
import {
  buyUpgrade,
  canBuyUpgrade,
  cancelUpgrade,
  hasAutomation,
  hasCourse,
  hasDashboard,
  hasEmployee,
  availableUpgrades,
  ownsEffect,
  nextUpgrade,
} from './upgrades';
import { withModifiers } from './modifiers';

const rich: GameState = {
  ...startState,
  money: 10_000_000,
  stats: { metier: 1000, gestion: 1000, intelligence: 1000, endurance: 1000 },
  reputation: 1000,
  reputationEarned: 1000,
  phase: 'boss',
  companies: { atelier: 1 },
};

const buy = (state: GameState, id: string) => buyUpgrade(state, id);

const idsOf = (requirement: Requirement): string[] => {
  switch (requirement.type) {
    case 'all':
    case 'any': {
      return requirement.of.flatMap((part) => idsOf(part));
    }
    case 'company': {
      return [`company:${requirement.id}`];
    }
    case 'upgrade': {
      return [`upgrade:${requirement.id}`];
    }
    case 'district': {
      return [`district:${requirement.id}`];
    }
    default: {
      return [];
    }
  }
};

describe('intégrité des données', () => {
  it('compte 19 améliorations aux ids uniques', () => {
    expect(upgrades).toHaveLength(19);
    expect(new Set(upgrades.map((upgrade) => upgrade.id)).size).toBe(19);
  });

  it('ne référence que des ids existants', () => {
    const known = new Set([
      ...upgrades.map((upgrade) => `upgrade:${upgrade.id}`),
      ...companies.map((company) => `company:${company.id}`),
      ...districts.map((district) => `district:${district.id}`),
    ]);
    for (const upgrade of upgrades) {
      const requirements = upgrade.requirement
        ? idsOf(upgrade.requirement)
        : [];
      for (const id of requirements) {
        expect(known.has(id), `${upgrade.id} → ${id}`).toBe(true);
      }
      for (const effect of upgrade.effects) {
        if (effect.type === 'course') {
          expect(courses.map((course) => course.id)).toContain(effect.courseId);
        }
        if (effect.type === 'productionBonus' && effect.companyId) {
          expect(companies.map((company) => company.id)).toContain(
            effect.companyId,
          );
        }
      }
    }
  });
});

describe('buyUpgrade', () => {
  it('débite le prix et marque l’amélioration comme achetée', () => {
    const next = buy(rich, 'cartes-visite');
    expect(next.money).toBe(rich.money - 58);
    expect(next.upgrades).toEqual(['cartes-visite']);
  });

  it('refuse si déjà achetée', () => {
    const once = buy(rich, 'cartes-visite');
    expect(buy(once, 'cartes-visite')).toBe(once);
  });

  it('refuse sans assez d’argent', () => {
    const poor = { ...rich, money: 57 };
    expect(buy(poor, 'cartes-visite')).toBe(poor);
  });

  it('refuse si la condition n’est pas remplie', () => {
    const novice = { ...rich, stats: startState.stats };
    expect(canBuyUpgrade(novice, 'bts-opportunites')).toBe(false);
    expect(buy(novice, 'bts-opportunites')).toBe(novice);
  });

  it('refuse une amélioration inconnue ou un personnage mort', () => {
    expect(buy(rich, 'nulle-part')).toBe(rich);
    const dead = { ...rich, status: 'dead' as const };
    expect(buy(dead, 'cartes-visite')).toBe(dead);
  });

  it('ajoute loyer et salaire récurrents', () => {
    const housed = buy(rich, 'studio-renove');
    expect(housed.rent).toBe(rich.rent + 34);
    const hired = buy(rich, 'premier-collaborateur');
    expect(hired.payroll).toBe(230);
  });
});

describe('effets', () => {
  it('cursus, logement, entrepôt et marqueurs : capacités et accès', () => {
    expect(hasCourse(rich, 'metier')).toBe(false);
    expect(hasCourse(buy(rich, 'stage-posture'), 'metier')).toBe(true);

    const housed = buy(rich, 'studio-renove');
    expect(housed.sleepMultiplier).toBe(1.5);
    expect(housed.housingId).toBe('studio-renove');
    expect(buy(housed, 'pavillon-tilleuls').sleepMultiplier).toBe(2.5);

    const stocked = buy(buy(rich, 'etageres-kit'), 'entrepot-logistique');
    expect(stocked.stockCapacity).toBe(rich.stockCapacity * 13 * 48);

    const noted = buy(buy(rich, 'carnet-notes'), 'application-productivite');
    expect(noted.maxMarkers).toBe(rich.maxMarkers + 2 + 3);
  });

  it('multiplicateurs de production, de ventes et de réputation', () => {
    expect(buy(rich, 'premier-collaborateur').productionMultiplier).toBe(2.1);
    expect(buy(rich, 'camionnette').companyMultipliers).toEqual({
      atelier: 1.15,
    });

    const advertised = buy(rich, 'plan-communication');
    expect(advertised.salesMultiplier).toBe(1.3);
    expect(advertised.reputationPerSaleMultiplier).toBe(1.5);

    const team = buy(rich, 'equipe-collaborateurs');
    expect(team.productionMultiplier).toBe(1.6);
    expect(team.salesMultiplier).toBe(1.6);

    expect(buy(rich, 'cartes-visite').workReputationMultiplier).toBe(1.25);
  });

  it('automatisations et tableau de bord sont mémorisés', () => {
    expect(hasAutomation(rich, 'work')).toBe(false);
    const next = buy(buy(rich, 'procedure-travail'), 'tableau-de-bord');
    expect(hasAutomation(next, 'work')).toBe(true);
    expect(hasDashboard(next)).toBe(true);
  });

  it('cumule plusieurs effets', () => {
    const next = buy(
      buy(buy(rich, 'premier-collaborateur'), 'equipe-collaborateurs'),
      'directeur-transformation',
    );
    expect(next.productionMultiplier).toBeCloseTo(1 + 1.1 + 0.6 + 3);
    expect(next.payroll).toBe(230 + 3600 + 45_000);
  });
});

describe('cancelUpgrade', () => {
  it('retire l’amélioration et ses effets sans rembourser', () => {
    const bought = buy(rich, 'premier-collaborateur');
    const next = cancelUpgrade(bought, 'premier-collaborateur');
    expect(next.upgrades).toEqual([]);
    expect(next.payroll).toBe(rich.payroll);
    expect(next.productionMultiplier).toBeCloseTo(rich.productionMultiplier);
    expect(next.money).toBe(bought.money);
  });

  it('rend le loyer, le stock et les marqueurs', () => {
    const housed = buy(rich, 'studio-renove');
    const equipped = buy(buy(housed, 'etageres-kit'), 'carnet-notes');
    const next = cancelUpgrade(equipped, 'carnet-notes');
    expect(next.maxMarkers).toBe(rich.maxMarkers);
    expect(next.rent).toBe(rich.rent + 34);
    expect(cancelUpgrade(next, 'etageres-kit').stockCapacity).toBe(
      rich.stockCapacity,
    );
  });

  it('ne garde que les marqueurs qui tiennent encore', () => {
    const bought = {
      ...buy(rich, 'carnet-notes'),
      markers: Array.from({ length: 7 }, () => 'metier' as const),
    };
    expect(cancelUpgrade(bought, 'carnet-notes').markers).toHaveLength(
      rich.maxMarkers,
    );
  });

  it('un logement annulé revient au précédent encore possédé, sinon au départ', () => {
    const both = buy(buy(rich, 'studio-renove'), 'pavillon-tilleuls');
    const back = cancelUpgrade(both, 'pavillon-tilleuls');
    expect(back.housingId).toBe('studio-renove');
    expect(back.sleepMultiplier).toBe(1.5);
    const start = cancelUpgrade(back, 'studio-renove');
    expect(start.housingId).toBe(rich.housingId);
    expect(start.sleepMultiplier).toBe(rich.sleepMultiplier);
  });

  it('coupe l’automatisation achetée', () => {
    const owner = buy(rich, 'procedure-travail');
    expect(hasAutomation(owner, 'work')).toBe(true);
    expect(
      hasAutomation(cancelUpgrade(owner, 'procedure-travail'), 'work'),
    ).toBe(false);
  });

  it('se rachète au même prix', () => {
    const again = buy(
      cancelUpgrade(buy(rich, 'cartes-visite'), 'cartes-visite'),
      'cartes-visite',
    );
    expect(again.money).toBe(rich.money - 116);
    expect(again.workReputationMultiplier).toBeCloseTo(1.25);
  });

  it('refuse ce qui n’est pas possédé ou quand le personnage est mort', () => {
    expect(cancelUpgrade(rich, 'cartes-visite')).toBe(rich);
    expect(cancelUpgrade(rich, 'nulle-part')).toBe(rich);
    const dead = { ...buy(rich, 'cartes-visite'), status: 'dead' as const };
    expect(cancelUpgrade(dead, 'cartes-visite')).toBe(dead);
  });
});

// Tout ce qu'une amélioration change, hors argent et comptes (non remboursés).
const derived = (state: GameState) => ({
  rent: state.rent,
  payroll: state.payroll,
  housingId: state.housingId,
  sleepMultiplier: state.sleepMultiplier,
  stockCapacity: state.stockCapacity,
  maxMarkers: state.maxMarkers,
  productionMultiplier: state.productionMultiplier,
  salesMultiplier: state.salesMultiplier,
  companyMultipliers: state.companyMultipliers,
  workReputationMultiplier: state.workReputationMultiplier,
  reputationPerSaleMultiplier: state.reputationPerSaleMultiplier,
  upgrades: state.upgrades,
});

describe('valeurs dérivées', () => {
  it('un loyer augmenté par un événement reste juste après une annulation', () => {
    const housed = buyUpgrade(rich, 'studio-renove');
    const raised = withModifiers({ ...housed, rentFactor: 1.05 });
    expect(raised.rent).toBe(Math.round(334 * 1.05));
    // Avant : 351 − 34 = 317 au lieu de 300 × 1,05.
    expect(cancelUpgrade(raised, 'studio-renove').rent).toBe(
      Math.round(300 * 1.05),
    );
  });

  it('la capacité de stock reste entière, quel que soit l’ordre des achats', () => {
    const shelved = buyUpgrade(rich, 'etageres-kit');
    const withWarehouse = withModifiers({ ...shelved, warehouses: 1 });
    expect(withWarehouse.stockCapacity).toBe((50 + 25) * 13);
    // Avant : (650 + 25) / 13 = 51,92…
    expect(cancelUpgrade(withWarehouse, 'etageres-kit').stockCapacity).toBe(75);
  });

  it('un état déjà à jour ne change pas', () => {
    let state = rich;
    for (const upgrade of upgrades) {
      state = buyUpgrade(state, upgrade.id);
    }
    expect(withModifiers(state)).toEqual(state);
  });
});

describe('acheter puis annuler', () => {
  it.each(upgrades.map((upgrade) => [upgrade.id]))(
    '%s : l’annulation défait exactement l’achat',
    (id) => {
      const bought = buyUpgrade(rich, id);
      expect(bought.upgrades).toContain(id);
      const cancelled = cancelUpgrade(bought, id);
      expect(derived(cancelled)).toEqual({
        ...derived(rich),
        companyMultipliers: expect.any(Object),
      });
      for (const [company, multiplier] of Object.entries(
        cancelled.companyMultipliers,
      )) {
        expect(multiplier).toBeCloseTo(rich.companyMultipliers[company] ?? 1);
      }
    },
  );
});

describe('ownsEffect', () => {
  it('trouve un effet possédé par son genre et son filtre', () => {
    const owner = buyUpgrade(rich, 'stage-posture');
    expect(ownsEffect(owner, 'course')).toBe(true);
    expect(
      ownsEffect(owner, 'course', (effect) => effect.courseId === 'metier'),
    ).toBe(true);
    expect(
      ownsEffect(owner, 'course', (effect) => effect.courseId === 'gestion'),
    ).toBe(false);
    expect(ownsEffect(rich, 'course')).toBe(false);
    expect(hasEmployee(buyUpgrade(rich, 'premier-collaborateur'))).toBe(true);
  });
});

describe('nextUpgrade', () => {
  it('propose la moins chère déjà débloquée', () => {
    expect(nextUpgrade(startState)?.id).toBe('cartes-visite');
  });

  it('passe à la suivante une fois achetée, et revient si on annule', () => {
    const bought = buy(rich, 'cartes-visite');
    expect(nextUpgrade(bought)?.id).not.toBe('cartes-visite');
    expect(nextUpgrade(cancelUpgrade(bought, 'cartes-visite'))?.id).toBe(
      'cartes-visite',
    );
  });

  it('ne propose rien quand tout est acheté', () => {
    const all = { ...startState, upgrades: upgrades.map((entry) => entry.id) };
    expect(nextUpgrade(all)).toBeUndefined();
  });

  it('fait toujours partie des améliorations disponibles', () => {
    // Le lien « prochaine amélioration » mène à une ligne de la liste.
    const owned = upgrades.map((entry) => entry.id);
    const states = [
      startState,
      rich,
      ...owned.map((_, index) => ({
        ...startState,
        upgrades: owned.slice(0, index),
      })),
      ...owned.map((_, index) => ({
        ...rich,
        upgrades: owned.slice(0, index),
      })),
    ];
    for (const state of states) {
      const next = nextUpgrade(state);
      if (next !== undefined) {
        expect(availableUpgrades(state)).toContain(next);
      }
    }
  });
});

describe('availableUpgrades', () => {
  it('liste les débloquées puis la prochaine verrouillée', () => {
    const list = availableUpgrades(rich);
    const locked = list.filter(
      (upgrade) =>
        upgrade.requirement !== undefined &&
        !isUnlocked(rich, upgrade.requirement),
    );
    expect(list.length).toBeGreaterThan(1);
    expect(locked.length).toBeLessThanOrEqual(1);
    expect(list.at(-1)).toBe(locked[0] ?? list.at(-1));
  });

  it('retire une amélioration achetée', () => {
    const ids = availableUpgrades(buy(rich, 'cartes-visite')).map(
      (upgrade) => upgrade.id,
    );
    expect(ids).not.toContain('cartes-visite');
  });

  it('est vide quand tout est acheté', () => {
    const all = { ...startState, upgrades: upgrades.map((entry) => entry.id) };
    expect(availableUpgrades(all)).toEqual([]);
  });
});
