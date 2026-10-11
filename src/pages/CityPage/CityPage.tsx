import { CityMap } from '@component/CityMap';
import { DistrictSheet } from '@component/DistrictSheet';
import { ImpactGauges } from '@component/ImpactGauges';
import { Window } from '@component/Window';
import { useCityScreen } from '@hook/useCityScreen';
import { useSeenTab } from '@hook/useSeenTab';

// Onglet « Ville » : orchestrateur de `useCityScreen`.
export const CityPage = () => {
  const city = useCityScreen();
  useSeenTab('city');

  return (
    <>
      <Window title="Plan de Sainte-Croissance">
        <CityMap
          title="Plan de la ville"
          slogan={city.slogan}
          districts={city.districts}
          onSelect={city.select}
        />
        <ImpactGauges caption="Impact sur la ville" gauges={city.city} />
      </Window>
      {city.sheet === undefined ? null : (
        <Window title="Fiche de quartier">
          <DistrictSheet {...city.sheet} />
        </Window>
      )}
    </>
  );
};
