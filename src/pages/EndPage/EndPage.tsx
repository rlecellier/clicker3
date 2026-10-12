import { Button } from '@component/Button';
import { FigureList } from '@component/FigureList';
import { Note } from '@component/Note';
import { Title } from '@component/Title';
import { ScreenPage } from '@component/ScreenPage';
import { Window } from '@component/Window';
import { useEndScreen } from '@hook/useEndScreen';

// Orchestrateur : branche `useEndScreen` sur les composants visuels.
export const EndPage = () => {
  const end = useEndScreen();

  return (
    <ScreenPage>
      <Window title="Fin d’exercice">
        <Title>You died</Title>
        <Note>Votre exercice est terminé. Voici le bilan.</Note>
        <FigureList figures={end.figures} />
        <Button variant="primary" onClick={end.replay}>
          Rejouer
        </Button>
      </Window>
    </ScreenPage>
  );
};
