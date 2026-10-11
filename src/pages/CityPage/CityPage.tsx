import { CityMap } from '@component/CityMap';
import { DistrictSheet } from '@component/DistrictSheet';
import { ImpactGauges } from '@component/ImpactGauges';
import { PageLink } from '@component/PageLink';
import { Window } from '@component/Window';
import { useCityScreen } from '@hook/useCityScreen';
import styles from './CityPage.module.css';

// Orchestrateur : branche `useCityScreen` sur les composants visuels.
export const CityPage = () => {
  const city = useCityScreen();

  return (
    <main className={styles.page}>
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
      <PageLink to="/jeu">Retour à ma vie</PageLink>
    </main>
  );
};
