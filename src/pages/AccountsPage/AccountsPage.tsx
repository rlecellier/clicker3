import { DataTable } from '@component/DataTable';
import { LedgerSection } from '@component/LedgerSection';
import { LedgerTable } from '@component/LedgerTable';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useAccountsScreen } from '@hook/useAccountsScreen';

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
          <LedgerSection
            title={dashboard.income.title}
            help={dashboard.income.help}
          >
            <LedgerTable caption="Recettes" rows={dashboard.income.rows} />
          </LedgerSection>
          <LedgerSection
            title={dashboard.expenses.title}
            help={dashboard.expenses.help}
          >
            <LedgerTable caption="Dépenses" rows={dashboard.expenses.rows} />
          </LedgerSection>
          <LedgerSection
            title={dashboard.stock.title}
            help={dashboard.stock.help}
          >
            <LedgerTable caption="Stock" rows={dashboard.stock.rows} />
          </LedgerSection>
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
          <LedgerSection
            title={dashboard.reputation.title}
            help={dashboard.reputation.help}
          >
            <LedgerTable
              caption="Réputation"
              rows={dashboard.reputation.rows}
            />
          </LedgerSection>
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
