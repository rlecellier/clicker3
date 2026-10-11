import { ConfirmPrompt } from '@component/ConfirmPrompt';
import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { PageLink } from '@component/PageLink';
import { Title } from '@component/Title';
import { Window } from '@component/Window';
import { screenPaths } from '@hook/useGameFlow';
import { useNewLifeScreen } from '@hook/useNewLifeScreen';
import styles from './NewLifePage.module.css';

// Orchestrateur : branche `useNewLifeScreen` sur les composants visuels.
export const NewLifePage = () => {
  const newLife = useNewLifeScreen();

  return (
    <main className={styles.page}>
      <Window title="Première embauche">
        <Title>Votre premier emploi</Title>
        <Note>Il faut bien commencer quelque part.</Note>
        {newLife.isConfirming ? (
          <ConfirmPrompt
            message="Une vie est déjà en cours. La recommencer l’archivera sans délai."
            confirmLabel="Recommencer"
            cancelLabel="Annuler"
            onConfirm={newLife.confirm}
            onCancel={newLife.cancel}
          />
        ) : (
          <ItemList caption="Postes à pourvoir" items={newLife.jobs} />
        )}
        <PageLink to={screenPaths.title}>Retour</PageLink>
      </Window>
    </main>
  );
};
