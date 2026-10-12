import { Button } from '@component/Button';
import { EventLog } from '@component/EventLog';
import { FigureList } from '@component/FigureList';
import { Note } from '@component/Note';
import { ScreenPage } from '@component/ScreenPage';
import { Window } from '@component/Window';
import { useAbsenceScreen } from '@hook/useAbsenceScreen';

// Orchestrateur : branche `useAbsenceScreen` sur les composants visuels.
export const AbsencePage = () => {
  const absence = useAbsenceScreen();

  if (absence === null) {
    return null;
  }

  return (
    <ScreenPage>
      <Window title="Pendant votre absence">
        <Note>
          Pendant votre absence, la croissance a continué. Elle n’a pas demandé
          de vos nouvelles.
        </Note>
        <FigureList figures={absence.figures} />
        <EventLog
          entries={absence.events}
          emptyText="Aucun événement. La ville a pris des notes."
        />
        <Button variant="primary" onClick={absence.dismiss}>
          {absence.hasDied ? 'Voir le bilan' : 'Reprendre ma vie'}
        </Button>
      </Window>
    </ScreenPage>
  );
};
