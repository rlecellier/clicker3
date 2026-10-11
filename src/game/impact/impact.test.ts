import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { deepFreeze } from '@test/deepFreeze';
import { impactOf } from './impact';
import type { ImpactId, ImpactReport } from './impact';

const valueOf = (indicators: ImpactReport['city'], id: ImpactId) =>
  indicators.find((indicator) => indicator.id === id)?.value ?? NaN;

const cityValue = (state: GameState, id: ImpactId) =>
  valueOf(impactOf(state).city, id);

const districtValue = (state: GameState, districtId: string, id: ImpactId) => {
  const found = impactOf(state).districts.find(
    (district) => district.districtId === districtId,
  );
  return valueOf(found?.indicators ?? [], id);
};

const open: GameState = {
  ...startState,
  districts: ['tilleuls', 'hauts-fourneaux', 'parc-horizon', 'pole-excellence'],
};

describe('impactOf', () => {
  it('vaut 0 au départ, pour la ville et le quartier', () => {
    const report = impactOf(startState);
    expect(report.city).toEqual([
      { id: 'pollution', value: 0 },
      { id: 'inequality', value: 0 },
    ]);
    expect(report.districts).toEqual([
      {
        districtId: 'tilleuls',
        indicators: [
          { id: 'pollution', value: 0 },
          { id: 'inequality', value: 0 },
        ],
      },
    ]);
  });

  it('ne donne que les quartiers débloqués, dans l’ordre de la carte', () => {
    expect(
      impactOf(open).districts.map((district) => district.districtId),
    ).toEqual([
      'tilleuls',
      'hauts-fourneaux',
      'parc-horizon',
      'pole-excellence',
    ]);
  });

  it('est déterministe', () => {
    const state = {
      ...open,
      money: 900,
      companies: { atelier: 3, boutique: 1 },
    };
    expect(impactOf(state)).toEqual(impactOf(state));
  });

  it('ne modifie pas l’état reçu', () => {
    const frozen = deepFreeze(structuredClone(open));
    expect(() => impactOf(frozen)).not.toThrow();
  });
});

describe('pollution', () => {
  it('monte avec la production industrielle', () => {
    let previous = -1;
    for (const copies of [0, 1, 3, 10, 40]) {
      const value = cityValue(
        { ...open, companies: { atelier: copies } },
        'pollution',
      );
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it('monte plus avec une usine qu’avec un commerce', () => {
    const factory = cityValue(
      { ...open, companies: { manufacture: 1 } },
      'pollution',
    );
    const shop = cityValue(
      { ...open, companies: { hypermarche: 1 } },
      'pollution',
    );
    expect(shop).toBeGreaterThan(0);
    expect(factory).toBeGreaterThan(shop);
  });

  it('monte avec les multiplicateurs de production', () => {
    const base = { ...open, companies: { atelier: 5 } };
    expect(
      cityValue({ ...base, productionMultiplier: 3 }, 'pollution'),
    ).toBeGreaterThan(cityValue(base, 'pollution'));
  });

  it('se pose dans le quartier de l’entreprise', () => {
    const state = { ...open, companies: { manufacture: 2 } };
    expect(
      districtValue(state, 'hauts-fourneaux', 'pollution'),
    ).toBeGreaterThan(0);
    expect(districtValue(state, 'tilleuls', 'pollution')).toBe(0);
    expect(districtValue(state, 'parc-horizon', 'pollution')).toBe(0);
  });

  it('replie une entreprise sur les Tilleuls si son quartier est fermé', () => {
    const closed = { ...startState, companies: { manufacture: 2 } };
    expect(districtValue(closed, 'tilleuls', 'pollution')).toBeGreaterThan(0);
    expect(cityValue(closed, 'pollution')).toBe(
      districtValue(closed, 'tilleuls', 'pollution'),
    );
  });
});

describe('inégalités', () => {
  it('montent avec l’argent du personnage', () => {
    let previous = -1;
    for (const money of [0, 500, 5000, 100_000]) {
      const value = cityValue({ ...open, money }, 'inequality');
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it('montent avec les entreprises possédées', () => {
    const poor = cityValue(open, 'inequality');
    const owner = cityValue(
      { ...open, companies: { atelier: 2 } },
      'inequality',
    );
    expect(owner).toBeGreaterThan(poor);
  });

  it('comptent l’argent dans le quartier de résidence seulement', () => {
    const rich = { ...open, money: 50_000 };
    expect(districtValue(rich, 'tilleuls', 'inequality')).toBeGreaterThan(0);
    expect(districtValue(rich, 'pole-excellence', 'inequality')).toBe(0);
  });
});

describe('bornes', () => {
  it('reste entre 0 et 100, entiers, même pour une fortune énorme', () => {
    const giant: GameState = {
      ...open,
      money: 1e12,
      productionMultiplier: 50,
      companies: {
        atelier: 100,
        boutique: 100,
        manufacture: 100,
        hypermarche: 100,
        'site-delocalise': 100,
        plateforme: 100,
      },
    };
    const report = impactOf(giant);
    const values = [
      ...report.city,
      ...report.districts.flatMap((district) => district.indicators),
    ].map((indicator) => indicator.value);
    for (const value of values) {
      expect(Number.isSafeInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
    expect(cityValue(giant, 'pollution')).toBeGreaterThan(95);
  });
});
