import { companyCost } from '@game/companies';
import { companies, districts, impactRules } from '@game/data';
import type { Company } from '@game/data';
import type { GameState } from '@game/state';

export type ImpactId = 'pollution' | 'inequality';

export type ImpactValue = { id: ImpactId; value: number };

export type DistrictImpact = { districtId: string; indicators: ImpactValue[] };

export type ImpactReport = {
  // Toute la ville.
  city: ImpactValue[];
  // Un bloc par quartier débloqué, dans l'ordre de la carte.
  districts: DistrictImpact[];
};

const saturate = (amount: number, half: number) =>
  amount <= 0 ? 0 : Math.round((100 * amount) / (amount + half));

const districtOfCompany = (state: GameState, company: Company) => {
  const wanted: string | undefined =
    impactRules.companyDistricts[
      company.id as keyof typeof impactRules.companyDistricts
    ];
  return wanted !== undefined && state.districts.includes(wanted)
    ? wanted
    : impactRules.homeDistrict;
};

// Charge polluante d'une entreprise : sortie ou capacité, avec les multiplicateurs.
const pollutionLoad = (state: GameState, company: Company) => {
  const copies = state.companies[company.id] ?? 0;
  const { weights } = impactRules.pollution;
  return company.kind === 'production'
    ? copies *
        company.output *
        state.productionMultiplier *
        (state.companyMultipliers[company.id] ?? 1) *
        weights.production
    : copies *
        company.capacity *
        state.salesMultiplier *
        (state.companyMultipliers[company.id] ?? 1) *
        weights.commerce;
};

// Valeur d'achat de tous les exemplaires possédés.
const assetValue = (state: GameState, company: Company) => {
  let total = 0;
  for (let index = 0; index < (state.companies[company.id] ?? 0); index++) {
    total += companyCost(company.id, index);
  }
  return total;
};

type Place = { pollutionLoad: number; assets: number };

const placeOf = (state: GameState, districtId: string | null): Place => {
  const here = companies.filter(
    (company) =>
      districtId === null || districtOfCompany(state, company) === districtId,
  );
  return {
    pollutionLoad: here.reduce(
      (total, company) => total + pollutionLoad(state, company),
      0,
    ),
    assets: here.reduce(
      (total, company) => total + assetValue(state, company),
      0,
    ),
  };
};

const indicatorsOf = (
  place: Place,
  money: number,
  residentWealth: number,
): ImpactValue[] => [
  {
    id: 'pollution',
    value: saturate(place.pollutionLoad, impactRules.pollution.half),
  },
  {
    id: 'inequality',
    value: saturate(place.assets + money, residentWealth),
  },
];

const residentWealthOf = (districtId: string) =>
  (impactRules.inequality.residentWealth as Record<string, number>)[
    districtId
  ] ?? 0;

/**
 * Indicateurs d'impact de la ville et de chaque quartier débloqué, de 0 à
 * 100. Dérivés de l'état, sans accumulation (ADR 0004).
 */
export const impactOf = (state: GameState): ImpactReport => {
  const totalResidents = Object.values(
    impactRules.inequality.residentWealth,
  ).reduce((sum, wealth) => sum + wealth, 0);
  return {
    city: indicatorsOf(placeOf(state, null), state.money, totalResidents),
    districts: districts
      .filter((district) => state.districts.includes(district.id))
      .map((district) => ({
        districtId: district.id,
        indicators: indicatorsOf(
          placeOf(state, district.id),
          district.id === impactRules.homeDistrict ? state.money : 0,
          residentWealthOf(district.id),
        ),
      })),
  };
};
