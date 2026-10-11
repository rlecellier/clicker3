import { ActionButton } from '@component/ActionButton';
import { AutoSwitch } from '@component/AutoSwitch';
import { CharacterHeader } from '@component/CharacterHeader';
import { ItemList } from '@component/ItemList';
import { MarkerTrack } from '@component/MarkerTrack';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useGameScreen } from '@hook/useGameScreen';
import styles from './GamePage.module.css';

// Orchestrateur : branche `useGameScreen` sur les composants visuels.
export const GamePage = () => {
  const screen = useGameScreen();
  const { work, sleep, sellSurplus } = screen.actions;

  return (
    <main className={styles.page}>
      <Window title="Ma vie à Sainte-Croissance">
        <CharacterHeader {...screen.header} />
        {screen.intro === null ? null : <Note>{screen.intro}</Note>}
        <ProgressBar
          label="Jauge de temps"
          value={screen.gauge.value}
          max={screen.gauge.max}
        />
        <dl className={styles.counters}>
          <Stat label="Argent" value={screen.counters.money} />
          <Stat label="Stock" value={screen.counters.stock} />
          <Stat label="Réputation" value={screen.counters.reputation} />
        </dl>
        <Note>{screen.objective}</Note>
        <div className={styles.actions}>
          <ActionButton
            label="Travailler"
            detail={work.detail}
            reason={work.reason}
            isDisabled={work.isDisabled}
            variant="primary"
            onClick={work.run}
          />
          <ActionButton
            label="Dormir"
            detail={sleep.detail}
            reason={sleep.reason}
            isDisabled={sleep.isDisabled}
            onClick={sleep.run}
          />
          <ActionButton
            label="Vendre le surplus"
            detail={sellSurplus.detail}
            reason={sellSurplus.reason}
            isDisabled={sellSurplus.isDisabled}
            onClick={sellSurplus.run}
          />
        </div>
        <p className={styles.feedback} role="status">
          {screen.feedback}
        </p>
        <MarkerTrack {...screen.markers} />
      </Window>
      <Window title="Compétences et stats">
        {screen.stats.map((stat) => (
          <ProgressBar
            key={stat.id}
            label={stat.label}
            value={stat.value}
            max={stat.max}
          />
        ))}
      </Window>
      {screen.courses.length === 0 ? null : (
        <Window title="Études">
          <ItemList caption="Cursus" items={screen.courses} />
        </Window>
      )}
      <Window title="Emploi">
        <ItemList caption="Postes" items={screen.jobs} />
      </Window>
      {screen.autos.length === 0 ? null : (
        <Window title="Automatisation">
          {screen.autos.map((auto) => (
            <AutoSwitch
              key={auto.id}
              label={auto.label}
              isChecked={auto.isChecked}
              onChange={auto.onChange}
            />
          ))}
        </Window>
      )}
    </main>
  );
};
