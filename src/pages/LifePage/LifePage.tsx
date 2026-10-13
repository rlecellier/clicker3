import { ActionButton } from '@component/ActionButton';
import { CharacterHeader } from '@component/CharacterHeader';
import { MarkerTrack } from '@component/MarkerTrack';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { ReputationStars } from '@component/ReputationStars';
import { SplitActionButton } from '@component/SplitActionButton';
import { ResourceTile } from '@component/ResourceTile';
import { Window } from '@component/Window';
import { useLifeScreen } from '@hook/useLifeScreen';
import { STUDY_SHORTCUT, WORK_SHORTCUT } from '@hook/useKeyboardShortcuts';
import styles from './LifePage.module.css';

const noop = () => {};

// Onglet « Vie » : orchestrateur de `useLifeScreen`.
export const LifePage = () => {
  const screen = useLifeScreen();
  const { work, sellSurplus } = screen.actions;
  const { study } = screen;

  return (
    <>
      <Window title="Balance de la période">
        <div className={styles.balances}>
          <dl className={styles.tile}>
            <ResourceTile
              icon="money"
              label="Argent"
              balance={screen.balances.money}
              to={screen.balanceLinks.money}
            />
          </dl>
          <div className={styles.stock}>
            <dl className={styles.tile}>
              <ResourceTile
                icon="stock"
                label="Stock"
                balance={screen.balances.stock}
                to={screen.balanceLinks.stock}
              />
            </dl>
            <ActionButton
              label="Vendre le surplus"
              detail={sellSurplus.detail}
              reason={sellSurplus.reason}
              isDisabled={sellSurplus.isDisabled}
              press={sellSurplus.press}
              onClick={sellSurplus.run}
            />
          </div>
        </div>
      </Window>
      <Window
        title="Ma vie à Sainte-Croissance"
        actions={<ReputationStars {...screen.reputation} />}
      >
        <CharacterHeader {...screen.header} />
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
        </div>
        <p className={styles.feedback} role="status">
          {screen.feedback}
        </p>
        <MarkerTrack {...screen.brain} />
        <ProgressBar
          label={screen.brain.isSleeping ? 'Sommeil' : 'Éveillé'}
          value={screen.brain.sleepProgress}
          max={Math.max(1, screen.brain.sleepSteps)}
        />
      </Window>
    </>
  );
};
