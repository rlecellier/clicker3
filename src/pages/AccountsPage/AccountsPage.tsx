import { LedgerTable } from '@component/LedgerTable';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useJournalScreen } from '@hook/useJournalScreen';

// Onglet « Comptes » : orchestrateur de `useJournalScreen`.
export const AccountsPage = () => {
  const journal = useJournalScreen();

  return (
    <Window title="Comptes">
      <Tabs
        tabs={[
          {
            id: 'ledger',
            label: 'Comptabilité',
            content: (
              <LedgerTable
                caption={journal.ledger.caption}
                rows={journal.ledger.rows}
              />
            ),
          },
          ...(journal.stock === null
            ? []
            : [
                {
                  id: 'stock',
                  label: 'Stock',
                  content: (
                    <LedgerTable
                      caption={journal.stock.caption}
                      rows={journal.stock.rows}
                    />
                  ),
                },
              ]),
        ]}
      />
    </Window>
  );
};
