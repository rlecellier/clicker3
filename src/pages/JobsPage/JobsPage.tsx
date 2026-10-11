import { ItemList } from '@component/ItemList';
import { Window } from '@component/Window';
import { useGameScreen } from '@hook/useGameScreen';

// Onglet « Emploi » : orchestrateur de `useGameScreen`.
export const JobsPage = () => {
  const screen = useGameScreen();

  return (
    <Window title="Emploi">
      <ItemList caption="Postes" items={screen.jobs} />
    </Window>
  );
};
