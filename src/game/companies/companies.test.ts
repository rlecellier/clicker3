import {
  companies,
  districts,
  economyRules,
  impactRules,
  startState,
} from '@game/data';
import {
  buyCompany,
  canBuyCompany,
  companyById,
  companyCost,
  isCompanyMaxed,
  ownedCount,
  buyWarehouse,
  canBuyWarehouse,
  fitsWarehouse,
  warehouseCost,
} from './companies';

const workshop = companies.find((company) => company.id === 'atelier');
if (workshop?.kind !== 'production') {
  throw new Error('atelier introuvable');
}
const workshopOutput = workshop.output;

const ready = {
  ...startState,
  money: 1_000_000,
  stockCapacity: 1_000_000,
  stats: { ...startState.stats, gestion: 10 },
};

describe('données des entreprises', () => {
  it('compte quatre entreprises de production et quatre de commerce', () => {
    const kinds = companies.map((company) => company.kind);
    expect(kinds.filter((kind) => kind === 'production')).toHaveLength(4);
    expect(kinds.filter((kind) => kind === 'commerce')).toHaveLength(4);
  });

  it('a une croissance par exemplaire supérieure à 1,15', () => {
    for (const company of companies) {
      expect(company.growth).toBeGreaterThan(1.15);
    }
  });
});

describe('companyCost', () => {
  it('suit coûtBase × croissance ^ possédés, arrondi', () => {
    const { baseCost, growth } = workshop;
    expect(companyCost('atelier', 0)).toBe(baseCost);
    expect(companyCost('atelier', 1)).toBe(Math.round(baseCost * growth));
    expect(companyCost('atelier', 2)).toBe(Math.round(baseCost * growth ** 2));
    expect(companyCost('atelier', 5)).toBe(Math.round(baseCost * growth ** 5));
  });
});

describe('buyCompany', () => {
  it('achète un exemplaire et débite le coût', () => {
    const next = buyCompany(ready, 'atelier');
    expect(next.companies).toEqual({ atelier: 1 });
    expect(next.money).toBe(1_000_000 - companyCost('atelier', 0));
  });

  it('achète plusieurs exemplaires à coût croissant', () => {
    const next = buyCompany(buyCompany(ready, 'atelier'), 'atelier');
    expect(next.companies['atelier']).toBe(2);
    expect(next.money).toBe(
      1_000_000 - companyCost('atelier', 0) - companyCost('atelier', 1),
    );
  });

  it('refuse sans assez d’argent', () => {
    const poor = { ...ready, money: companyCost('atelier', 0) - 1 };
    expect(buyCompany(poor, 'atelier')).toBe(poor);
  });

  it('refuse si la condition manque', () => {
    const novice = { ...ready, stats: startState.stats };
    expect(canBuyCompany(novice, 'atelier')).toBe(false);
    expect(buyCompany(novice, 'atelier')).toBe(novice);
    expect(canBuyCompany(ready, 'plateforme')).toBe(false);
  });

  it('refuse un type inconnu ou un personnage mort', () => {
    expect(buyCompany(ready, 'nulle-part')).toBe(ready);
    const dead = { ...ready, status: 'dead' as const };
    expect(buyCompany(dead, 'atelier')).toBe(dead);
  });
});

describe('plafond d’exemplaires par quartier', () => {
  const rich = {
    ...ready,
    stockCapacity: 1_000_000,
    districts: [
      'tilleuls',
      'hauts-fourneaux',
      'parc-horizon',
      'pole-excellence',
    ],
  };

  it('a un plafond et un quartier pour chaque type', () => {
    for (const company of companies) {
      expect(company.maxCopies).toBeGreaterThan(0);
      expect(districts.map((district) => district.id)).toContain(
        impactRules.companyDistricts[company.id],
      );
    }
  });

  it('refuse l’exemplaire au-delà du plafond, sans rien débiter', () => {
    const max = companyById('boutique')?.maxCopies ?? 0;
    const full = { ...rich, companies: { boutique: max } };
    expect(isCompanyMaxed(full, 'boutique')).toBe(true);
    expect(canBuyCompany(full, 'boutique')).toBe(false);
    expect(buyCompany(full, 'boutique')).toBe(full);
    const almost = { ...rich, companies: { boutique: max - 1 } };
    expect(canBuyCompany(almost, 'boutique')).toBe(true);
    expect(buyCompany(almost, 'boutique').companies['boutique']).toBe(max);
  });

  it('garde les exemplaires d’une ancienne sauvegarde au-delà du plafond', () => {
    const old = { ...rich, companies: { boutique: 103 } };
    expect(ownedCount(old, 'boutique')).toBe(103);
    expect(canBuyCompany(old, 'boutique')).toBe(false);
  });

  it('plafonne chaque type indépendamment', () => {
    const max = companyById('boutique')?.maxCopies ?? 0;
    const full = { ...rich, companies: { boutique: max } };
    expect(canBuyCompany(full, 'atelier')).toBe(true);
  });
});

describe('entrepôt', () => {
  it('refuse une production qui dépasse la capacité du stock', () => {
    const small = { ...ready, stockCapacity: workshopOutput + 1 };
    const one = buyCompany(small, 'atelier');
    expect(one.companies['atelier']).toBe(1);
    expect(fitsWarehouse(one, 'atelier')).toBe(false);
    expect(buyCompany(one, 'atelier')).toBe(one);
  });

  it('autorise à nouveau l’achat une fois l’entrepôt agrandi', () => {
    const full = {
      ...ready,
      stockCapacity: workshopOutput,
      companies: { atelier: 1 },
    };
    expect(canBuyCompany(full, 'atelier')).toBe(false);
    expect(
      canBuyCompany({ ...full, stockCapacity: 2 * workshopOutput }, 'atelier'),
    ).toBe(true);
  });

  it('ne bloque plus quand tous les agrandissements sont achetés', () => {
    const maxed = {
      ...ready,
      stockCapacity: 2,
      companies: { atelier: 1 },
      upgrades: ['etageres-kit', 'entrepot-logistique'],
    };
    expect(canBuyCompany(maxed, 'atelier')).toBe(true);
  });

  it('ne limite jamais l’achat d’un commerce', () => {
    const jammed = { ...ready, stockCapacity: 0 };
    expect(canBuyCompany(jammed, 'boutique')).toBe(true);
  });
});

describe('petits entrepôts', () => {
  it('coûtent de plus en plus cher, arrondi', () => {
    const { baseCost, growth } = economyRules.warehouse;
    expect(warehouseCost(0)).toBe(baseCost);
    expect(warehouseCost(1)).toBe(Math.round(baseCost * growth));
    expect(warehouseCost(2)).toBe(Math.round(baseCost * growth ** 2));
    expect(warehouseCost(2)).toBeGreaterThan(warehouseCost(0));
  });

  it('ajoutent de la capacité et débitent le coût', () => {
    const { baseCost, capacity } = economyRules.warehouse;
    const next = buyWarehouse({ ...startState, money: 5 * baseCost });
    expect(next.warehouses).toBe(1);
    expect(next.stockCapacity).toBe(startState.stockCapacity + capacity);
    expect(next.money).toBe(4 * baseCost);
  });

  it('se débloquent toujours, sans condition de compétence', () => {
    const { baseCost } = economyRules.warehouse;
    expect(canBuyWarehouse({ ...startState, money: baseCost })).toBe(true);
  });

  it('refusent sans assez d’argent ou si le personnage est mort', () => {
    const poor = {
      ...startState,
      money: economyRules.warehouse.baseCost - 1,
    };
    expect(buyWarehouse(poor)).toBe(poor);
    const dead = { ...startState, money: 500, status: 'dead' as const };
    expect(buyWarehouse(dead)).toBe(dead);
  });
});
