import { EventLog } from '@component/EventLog';
import { Window } from '@component/Window';
import { useJournalScreen } from '@hook/useJournalScreen';

// Onglet « Courrier » : orchestrateur de `useJournalScreen`.
export const MailPage = () => {
  const journal = useJournalScreen();

  return (
    <Window title="Courrier">
      <EventLog
        entries={journal.entries}
        emptyText="Aucun courrier. La boîte aux lettres vous remercie de votre patience."
      />
    </Window>
  );
};
