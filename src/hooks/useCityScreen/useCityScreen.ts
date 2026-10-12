import { useState } from 'react';
import type { Gauge } from '@component/ImpactGauges';
import type { MapDistrict } from '@component/CityMap';
import { useGameContext } from '@context/GameContext';
import { ownedCount } from '@game/companies';
import { companies, districts } from '@game/data';
import { districtById } from '@game/districts';
import { describeRequirement, formatCount } from '@game/format';
import { districtOfCompany } from '@game/impact';
import type { ImpactValue } from '@game/impact';
import { useGameImpact } from '@hook/useGameImpact';
import { useGameActions } from '@hook/useGameActions';
import { districtItem } from '@view/districtItem';

export const slogan = 'Sainte-Croissance, ville en mouvement.';

// Libellés sobres : le sérieux administratif fait le travail.
const impactLabels = {
  pollution: 'Pollution (dynamisme industriel)',
  inequality: 'Inégalités (convergence en cours)',
} as const;

const toGauges = (indicators: readonly ImpactValue[]): Gauge[] =>
  indicators.map((indicator) => ({
    id: indicator.id,
    label: impactLabels[indicator.id],
    value: indicator.value,
  }));

// La carte de la ville : quartiers, bâtiments, fiche du quartier choisi et
// indicateurs d'impact (lecture seule).
export const useCityScreen = () => {
  const { state } = useGameContext();
  const impact = useGameImpact();
  const actions = useGameActions();
  const [selectedId, select] = useState(districts[0]?.id);

  const mapDistricts: MapDistrict[] = districts.map((district) => ({
    id: district.id,
    name: district.name,
    isLocked: !state.districts.includes(district.id),
    isSelected: district.id === selectedId,
    conditions: [
      district.requirement === undefined
        ? undefined
        : describeRequirement(district.requirement),
      `${formatCount(district.cost)} de réputation`,
    ].filter((condition) => condition !== undefined),
    buildings: companies
      .filter(
        (company) =>
          ownedCount(state, company.id) > 0 &&
          districtOfCompany(state, company) === district.id,
      )
      .map((company) => ({
        id: company.id,
        label: company.name,
        kind: company.kind,
        count: ownedCount(state, company.id),
      })),
  }));

  const district =
    selectedId === undefined ? undefined : districtById(selectedId);
  const item =
    district === undefined
      ? undefined
      : districtItem(state, district, () => {
          actions.unlockDistrict(district.id);
        });
  const districtImpact = impact.districts.find(
    (candidate) => candidate.districtId === selectedId,
  );

  return {
    slogan,
    districts: mapDistricts,
    select,
    city: toGauges(impact.city),
    sheet:
      district === undefined || item === undefined
        ? undefined
        : {
            name: district.name,
            description: district.description,
            detail: `${formatCount(district.cost)} de réputation`,
            badge: item.badge,
            actionLabel: item.actionLabel,
            isDisabled: item.isDisabled,
            reason: item.reason,
            onAction: item.onAction,
            gauges: toGauges(districtImpact?.indicators ?? []),
          },
  };
};
