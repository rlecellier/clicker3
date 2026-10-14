import { ActionButton } from '@component/ActionButton';
import { CharacterHeader } from '@component/CharacterHeader';
import { MarkerTrack } from '@component/MarkerTrack';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { ReputationStars } from '@component/ReputationStars';
import { SleepSummary } from '@component/SleepSummary';
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
          <dl className={styles.tiles}>
            <ResourceTile
              icon="money"
              label="Argent"
              balance={screen.balances.money}
              to={screen.balanceLinks.money}
            />
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
      </Window>
      <Window
        title="Ma vie à Sainte-Croissance"
        actions={<ReputationStars {...screen.reputation} />}
      >
        <CharacterHeader {...screen.header} />
        {/* Sur mobile, la pastille de la sidebar remplace cette note. */}
        <div className={styles.objective}>
          <Note minLines={2} to={screen.objective.to}>
            {screen.objective.text}
          </Note>
        </div>
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
          <div className={styles.markers}>
            <MarkerTrack {...screen.brain} />
          </div>
          {/* Emplacement toujours occupé par la même structure : quand rien
            n'est étudiable, une copie invisible garde la hauteur de la zone. */}
          <div
            className={study.action === null ? styles.reserved : styles.study}
            aria-hidden={study.action === null ? 'true' : undefined}
            inert={study.action === null}
          >
            <ProgressBar
              size="small"
              label={study.gauge?.label ?? '\u{A0}'}
              value={study.gauge?.value ?? 0}
              max={study.gauge?.max ?? 1}
            />
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
          </div>
        </div>
        <SleepSummary {...screen.sleep} />
      </Window>
    </>
  );
};
