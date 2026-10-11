import { Button } from '@component/Button';
import { FigureList } from '@component/FigureList';
import { Note } from '@component/Note';
import { Title } from '@component/Title';
import { Window } from '@component/Window';
import { useEndScreen } from '@hook/useEndScreen';
import styles from './EndPage.module.css';

// Orchestrateur : branche `useEndScreen` sur les composants visuels.
export const EndPage = () => {
  const end = useEndScreen();

  return (
    <main className={styles.page}>
      <Window title="Fin d’exercice">
        <Title>You died</Title>
        <Note>Votre exercice est terminé. Voici le bilan.</Note>
        <FigureList figures={end.figures} />
        <Button variant="primary" onClick={end.replay}>
          Rejouer
        </Button>
      </Window>
    </main>
  );
};
