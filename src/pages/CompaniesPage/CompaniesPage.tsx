import { ItemList } from '@component/ItemList';
import { ProgressBar } from '@component/ProgressBar';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useCompaniesScreen } from '@hook/useCompaniesScreen';
import { useSeenTab } from '@hook/useSeenTab';

// Onglet « Entreprises » : orchestrateur de `useCompaniesScreen` et
// `useSeenTab`.
export const CompaniesPage = () => {
  const screen = useCompaniesScreen();
  useSeenTab('companies');

  return (
    <Window title="Entreprises">
      <ProgressBar
        label={screen.stock.label}
        value={screen.stock.value}
        max={screen.stock.max}
      />
      <Tabs
        tabs={[
          {
            id: 'companies',
            label: 'À acheter',
            content: (
              <ItemList caption="Entreprises" items={screen.companies} />
            ),
          },
          {
            id: 'districts',
            label: 'Quartiers',
            content: <ItemList caption="Quartiers" items={screen.districts} />,
          },
        ]}
      />
    </Window>
  );
};
