import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { Window } from '@component/Window';
import { useHouseScreen } from '@hook/useHouseScreen';

// Onglet « Maison » : orchestrateur de `useHouseScreen`.
export const HousePage = () => {
  const screen = useHouseScreen();

  return (
    <Window title="Maison">
      <Note>{screen.favoritesText}</Note>
      {screen.feedback === null ? null : <p role="status">{screen.feedback}</p>}
      {screen.sections.map((section) => (
        <ItemList
          key={section.caption}
          caption={section.caption}
          items={section.items}
        />
      ))}
    </Window>
  );
};
