import { DataTable } from '@component/DataTable';
import { ItemList } from '@component/ItemList';
import { LedgerSection } from '@component/LedgerSection';
import { Note } from '@component/Note';
import { PageLink } from '@component/PageLink';
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
      <PageLink to={screen.stock.detailPath}>Détail du stock</PageLink>
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
          {
            id: 'ledger',
            label: 'Comptabilité',
            content:
              screen.ledger.rows.length === 0 ? (
                <Note>Aucune entreprise pour le moment.</Note>
              ) : (
                <LedgerSection
                  title={screen.ledger.title}
                  help={screen.ledger.help}
                >
                  <DataTable
                    caption="Entreprises"
                    columns={screen.ledger.columns}
                    rows={screen.ledger.rows}
                  />
                </LedgerSection>
              ),
          },
          {
            id: 'upgrades',
            label: 'Améliorations',
            content:
              screen.upgrades.length === 0 ? (
                <Note>Plus d’amélioration d’entreprise à acheter.</Note>
              ) : (
                <ItemList
                  caption="Améliorations des entreprises"
                  items={screen.upgrades}
                />
              ),
          },
        ]}
      />
    </Window>
  );
};
