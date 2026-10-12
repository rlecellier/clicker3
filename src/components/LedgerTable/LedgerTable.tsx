import { DataTable } from '@component/DataTable';

export type LedgerRow = {
  id: string;
  label: string;
  amount: string;
  // Part du total de la section (« 42 % ») ; absente quand elle n'a pas de sens.
  share?: string;
};

type LedgerTableProperties = {
  caption: string;
  rows: readonly LedgerRow[];
};

const columns = [
  { id: 'label', header: 'Poste' },
  { id: 'amount', header: 'Montant', isNumeric: true },
  { id: 'share', header: 'Part', isNumeric: true },
] as const;

export const LedgerTable = ({ caption, rows }: LedgerTableProperties) => (
  <DataTable
    caption={caption}
    columns={columns}
    rows={rows.map((row) => ({
      id: row.id,
      cells: [row.label, row.amount, row.share ?? ''],
    }))}
  />
);
