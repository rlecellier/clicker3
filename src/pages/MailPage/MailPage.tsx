import { EventLog } from '@component/EventLog';
import { Window } from '@component/Window';
import { useMailScreen } from '@hook/useMailScreen';

// Onglet « Courrier » : orchestrateur de `useMailScreen`.
export const MailPage = () => {
  const mail = useMailScreen();

  return (
    <Window title="Courrier">
      <EventLog
        entries={mail.entries}
        emptyText="Aucun courrier. La boîte aux lettres vous remercie de votre patience."
      />
    </Window>
  );
};
