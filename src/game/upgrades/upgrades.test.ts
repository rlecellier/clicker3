import {
  companies,
  courses,
  districts,
  startState,
  upgrades,
} from '@game/data';
import type { Requirement } from '@game/requirements';
import type { GameState } from '@game/state';
import {
  buyUpgrade,
  canBuyUpgrade,
  hasAutomation,
  hasCourse,
  hasDashboard,
} from './upgrades';

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
  it('compte 20 améliorations aux ids uniques', () => {
    expect(upgrades).toHaveLength(20);
    expect(new Set(upgrades.map((upgrade) => upgrade.id)).size).toBe(20);
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
  it('cursus : ouvre l’étude d’une stat', () => {
    expect(hasCourse(rich, 'metier')).toBe(false);
    expect(hasCourse(buy(rich, 'stage-posture'), 'metier')).toBe(true);
  });

  it('logement : multiplicateur de sommeil', () => {
    const next = buy(rich, 'studio-renove');
    expect(next.sleepMultiplier).toBe(1.5);
    expect(next.housingId).toBe('studio-renove');
    expect(buy(next, 'pavillon-tilleuls').sleepMultiplier).toBe(2.5);
  });

  it('entrepôt : capacité du stock multipliée', () => {
    const next = buy(buy(rich, 'etageres-kit'), 'entrepot-logistique');
    expect(next.stockCapacity).toBe(rich.stockCapacity * 13 * 48);
  });

  it('marqueurs : maximum augmenté', () => {
    const next = buy(buy(rich, 'carnet-notes'), 'application-productivite');
    expect(next.maxMarkers).toBe(rich.maxMarkers + 2 + 3);
  });

  it('production : globale ou propre à un type d’entreprise', () => {
    expect(buy(rich, 'premier-collaborateur').productionMultiplier).toBe(2.1);
    expect(buy(rich, 'camionnette').companyMultipliers).toEqual({
      atelier: 1.15,
    });
  });

  it('ventes et réputation par vente', () => {
    const next = buy(rich, 'plan-communication');
    expect(next.salesMultiplier).toBe(1.3);
    expect(next.reputationPerSaleMultiplier).toBe(1.5);
  });

  it('toutes les entreprises : production et ventes', () => {
    const next = buy(rich, 'equipe-collaborateurs');
    expect(next.productionMultiplier).toBe(1.6);
    expect(next.salesMultiplier).toBe(1.6);
  });

  it('réputation gagnée par le travail', () => {
    expect(buy(rich, 'cartes-visite').workReputationMultiplier).toBe(1.25);
  });

  it('automatisations et tableau de bord sont mémorisés', () => {
    expect(hasAutomation(rich, 'work')).toBe(false);
    const next = buy(
      buy(buy(rich, 'procedure-travail'), 'rythme-sommeil'),
      'tableau-de-bord',
    );
    expect(hasAutomation(next, 'work')).toBe(true);
    expect(hasAutomation(next, 'sleep')).toBe(true);
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
