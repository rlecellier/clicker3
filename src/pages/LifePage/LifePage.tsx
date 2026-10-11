import { ActionButton } from '@component/ActionButton';
import { CharacterHeader } from '@component/CharacterHeader';
import { MarkerTrack } from '@component/MarkerTrack';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { SplitActionButton } from '@component/SplitActionButton';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useGameScreen } from '@hook/useGameScreen';
import styles from './LifePage.module.css';

// Onglet « Vie » : orchestrateur de `useGameScreen`.
export const LifePage = () => {
  const screen = useGameScreen();
  const { work, sellSurplus } = screen.actions;
  const { study } = screen;

  return (
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
      </dl>
      <Note minLines={2}>{screen.objective}</Note>
      <div className={styles.actions}>
        <ActionButton
          label="Travailler"
          detail={work.detail}
          reason={work.reason}
          isDisabled={work.isDisabled}
          variant="primary"
          isAuto={work.isAuto}
          autoHint={work.autoHint}
          press={work.press}
          onClick={work.run}
        />
        {study.action === null ? null : (
          <SplitActionButton
            label="Étudier"
            detail={study.action.detail}
            reason={study.action.reason}
            isDisabled={study.action.isDisabled}
            menuLabel="Choisir le cursus"
            choices={study.choices}
            selectedId={study.selectedId}
            onSelect={study.select}
            onClick={study.action.run}
          />
        )}
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
      <MarkerTrack {...screen.brain} />
      <ProgressBar
        label={screen.brain.isSleeping ? 'Sommeil' : 'Éveillé'}
        value={screen.brain.sleepProgress}
        max={screen.brain.max}
      />
    </Window>
  );
};
