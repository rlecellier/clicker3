import { ItemList } from '@component/ItemList';
import { Window } from '@component/Window';
import { useJobsScreen } from '@hook/useJobsScreen';
import { useSeenTab } from '@hook/useSeenTab';

// Onglet « Emploi » : orchestrateur de `useJobsScreen`.
export const JobsPage = () => {
  const screen = useJobsScreen();
  useSeenTab('jobs');

  return (
    <Window title="Emploi">
      <ItemList caption="Postes" items={screen.jobs} />
    </Window>
  );
};
