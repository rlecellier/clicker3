import { DataTable } from '@component/DataTable';
import { LedgerSection } from '@component/LedgerSection';
import { LedgerTable } from '@component/LedgerTable';
import type { LedgerRow } from '@component/LedgerTable';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useAccountsScreen } from '@hook/useAccountsScreen';
import { accountsSectionIds } from '@hook/useGameTabs';

type LedgerSectionData = {
  title: string;
  help: string;
  rows: readonly LedgerRow[];
};

// Une section des comptes : titre, aide, puis son tableau.
const ledgerSection = (
  section: LedgerSectionData,
  caption: string,
  id?: string,
) => (
  <LedgerSection id={id} title={section.title} help={section.help}>
    <LedgerTable caption={caption} rows={section.rows} />
  </LedgerSection>
);

// Onglet « Comptes » : orchestrateur de `useAccountsScreen`.
export const AccountsPage = () => {
  const accounts = useAccountsScreen();
  const { dashboard } = accounts;

  const body = (
    <>
      <p>{accounts.heading}</p>
      {dashboard === null ? (
        <LedgerTable
          caption={accounts.basic.caption}
          rows={accounts.basic.rows}
        />
      ) : (
        <>
          {ledgerSection(
            dashboard.income,
            'Recettes',
            accountsSectionIds.money,
          )}
          {ledgerSection(dashboard.expenses, 'Dépenses')}
          {ledgerSection(dashboard.stock, 'Stock', accountsSectionIds.stock)}
          <LedgerSection
            title={dashboard.buildings.title}
            help={dashboard.buildings.help}
          >
            <DataTable
              caption="Entreprises"
              columns={dashboard.buildings.columns}
              rows={dashboard.buildings.rows}
            />
          </LedgerSection>
          {ledgerSection(dashboard.reputation, 'Réputation')}
        </>
      )}
    </>
  );

  return (
    <Window title="Comptes">
      <Tabs
        value={accounts.selected}
        onValueChange={accounts.select}
        tabs={accounts.tabs.map((tab) => ({
          ...tab,
          content: tab.id === accounts.selected ? body : null,
        }))}
      />
    </Window>
  );
};
