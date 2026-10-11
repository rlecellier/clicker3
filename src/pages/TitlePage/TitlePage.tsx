import { Button } from '@component/Button';
import { ConfirmPrompt } from '@component/ConfirmPrompt';
import { Note } from '@component/Note';
import { PageLink } from '@component/PageLink';
import { Title } from '@component/Title';
import { Window } from '@component/Window';
import { screenPaths } from '@hook/useGameFlow';
import type { TitleConfirmation } from '@hook/useTitleScreen';
import { useTitleScreen } from '@hook/useTitleScreen';
import styles from './TitlePage.module.css';

const prompts: Record<TitleConfirmation, { message: string; confirm: string }> =
  {
    start: {
      message:
        'Une vie est déjà en cours. La recommencer l’archivera sans délai.',
      confirm: 'Recommencer',
    },
    erase: {
      message: 'Effacer la sauvegarde ? Votre exercice sera clos sans bilan.',
      confirm: 'Effacer',
    },
  };

// Orchestrateur : branche `useTitleScreen` sur les composants visuels.
export const TitlePage = () => {
  const title = useTitleScreen();
  const prompt = title.confirming === null ? null : prompts[title.confirming];

  return (
    <main className={styles.page}>
      <Window title="Sainte-Croissance">
        <Title>Sainte-Croissance</Title>
        <Note>Ville en mouvement.</Note>
        {prompt === null ? (
          <div className={styles.actions}>
            <Button variant="primary" size="large" onClick={title.askStart}>
              Démarrer ma vie
            </Button>
            {title.hasSave ? (
              <>
                <PageLink to={screenPaths.game}>Reprendre</PageLink>
                <Button variant="danger" onClick={title.askErase}>
                  Effacer la sauvegarde
                </Button>
              </>
            ) : null}
          </div>
        ) : (
          <ConfirmPrompt
            message={prompt.message}
            confirmLabel={prompt.confirm}
            cancelLabel="Annuler"
            onConfirm={title.confirm}
            onCancel={title.cancel}
          />
        )}
      </Window>
    </main>
  );
};
