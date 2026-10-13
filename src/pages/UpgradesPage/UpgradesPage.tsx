import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useSeenTab } from '@hook/useSeenTab';
import { useUpgradeTarget } from '@hook/useUpgradeTarget';
import { useUpgradesScreen } from '@hook/useUpgradesScreen';

// Onglet « Améliorations » : orchestrateur de `useUpgradesScreen`,
// `useUpgradeTarget` et `useSeenTab`.
export const UpgradesPage = () => {
  const screen = useUpgradesScreen();
  const target = useUpgradeTarget();
  useSeenTab('upgrades');

  return (
    <Window title="Améliorations">
      <Tabs
        value={target.tab}
        onValueChange={target.setTab}
        tabs={[
          {
            id: 'available',
            label: 'À acheter',
            content: (
              <>
                {screen.available.length === 0 ? (
                  <Note>Plus rien à acheter pour le moment.</Note>
                ) : (
                  <ItemList
                    caption="Améliorations"
                    items={screen.available}
                    highlightedId={target.highlightedId}
                  />
                )}
                <ItemList
                  caption="Coups de pouce (temporaires)"
                  items={screen.boosts}
                />
              </>
            ),
          },
          {
            id: 'owned',
            label: 'Obtenues',
            content:
              screen.owned.length === 0 ? (
                <Note>Aucune amélioration obtenue pour le moment.</Note>
              ) : (
                <ItemList caption="Obtenues" items={screen.owned} />
              ),
          },
        ]}
      />
    </Window>
  );
};
