import { ItemList } from '@component/ItemList';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useRelationsScreen } from '@hook/useRelationsScreen';

// Onglet « Relations » : orchestrateur de `useRelationsScreen`.
export const RelationsPage = () => {
  const screen = useRelationsScreen();

  return (
    <Window title="Relations">
      <Tabs
        tabs={screen.sections.map((section) => ({
          id: section.id,
          label: section.label,
          content: <ItemList caption={section.label} items={section.items} />,
        }))}
      />
    </Window>
  );
};
