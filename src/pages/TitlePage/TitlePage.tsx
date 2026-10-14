import { Button } from '@component/Button';
import { ConfirmPrompt } from '@component/ConfirmPrompt';
import { Note } from '@component/Note';
import { PageLink } from '@component/PageLink';
import { Title } from '@component/Title';
import { ScreenPage } from '@component/ScreenPage';
import { Window } from '@component/Window';
import { screenPaths } from '@hook/useGameFlow';
import type { TitleConfirmation } from '@hook/useTitleScreen';
import { useTitleScreen } from '@hook/useTitleScreen';
import styles from './TitlePage.module.css';

const prompts: Record<TitleConfirmation, { message: string; confirm: string }> =
  {
    erase: {
      message: 'Effacer la sauvegarde ? Votre exercice sera clos sans bilan.',
      confirm: 'Effacer',
    },
    restart: {
      message:
        'Une vie est déjà en cours. La recommencer l’archivera sans délai.',
      confirm: 'Recommencer',
    },
  };

// Orchestrateur : branche `useTitleScreen` sur les composants visuels.
export const TitlePage = () => {
  const title = useTitleScreen();
  const prompt = title.confirming === null ? null : prompts[title.confirming];

  return (
    <ScreenPage>
      <Window title="Sainte-Croissance">
        <Title>Sainte-Croissance</Title>
        <Note>Ville en mouvement.</Note>
        {prompt === null ? (
          <div className={styles.actions}>
            <PageLink to={screenPaths.newLife}>Démarrer ma vie</PageLink>
            <Note>Ou commencer plus tôt :</Note>
            {title.slices.map((slice) => (
              <Button key={slice.id} onClick={slice.start}>
                {slice.label}
              </Button>
            ))}
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
    </ScreenPage>
  );
};
