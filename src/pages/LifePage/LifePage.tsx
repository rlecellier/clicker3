import { ActionButton } from '@component/ActionButton';
import { CharacterHeader } from '@component/CharacterHeader';
import { MarkerTrack } from '@component/MarkerTrack';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { SplitActionButton } from '@component/SplitActionButton';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useGameScreen } from '@hook/useGameScreen';
import { STUDY_SHORTCUT, WORK_SHORTCUT } from '@hook/useKeyboardShortcuts';
import styles from './LifePage.module.css';

const noop = () => {};

// Onglet « Vie » : orchestrateur de `useGameScreen`.
export const LifePage = () => {
  const screen = useGameScreen();
  const { work, sellSurplus } = screen.actions;
  const { study } = screen;

  return (
    <Window title="Ma vie à Sainte-Croissance">
      <CharacterHeader {...screen.header} />
      <dl className={styles.counters}>
        <Stat
          label="Stock"
          value={screen.counters.stock}
          exact={screen.counters.exactStock}
          balance={screen.counters.stockBalance}
        />
      </dl>
      <Note minLines={2} to={screen.objective.to}>
        {screen.objective.text}
      </Note>
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
          shortcut={WORK_SHORTCUT}
          onClick={work.run}
        />
        {/* Emplacement toujours occupé par la même structure : quand rien
            n'est étudiable, une copie invisible garde la hauteur de la zone. */}
        <div
          className={study.action === null ? styles.reserved : styles.study}
          aria-hidden={study.action === null ? 'true' : undefined}
          inert={study.action === null}
        >
          <SplitActionButton
            label="Étudier"
            detail={study.action?.detail ?? ' '}
            reason={study.action?.reason}
            isDisabled={study.action?.isDisabled ?? true}
            menuLabel="Choisir le cursus"
            choices={study.choices}
            selectedId={study.selectedId}
            onSelect={study.select}
            press={study.action?.press}
            shortcut={study.action === null ? undefined : STUDY_SHORTCUT}
            onClick={study.action?.run ?? noop}
          />
          <ProgressBar
            size="small"
            label={study.gauge?.label ?? '\u{A0}'}
            value={study.gauge?.value ?? 0}
            max={study.gauge?.max ?? 1}
          />
        </div>
        <ActionButton
          label="Vendre le surplus"
          detail={sellSurplus.detail}
          reason={sellSurplus.reason}
          isDisabled={sellSurplus.isDisabled}
          press={sellSurplus.press}
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
