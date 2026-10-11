import { DataTable } from '@component/DataTable';

export type LedgerRow = {
  id: string;
  label: string;
  last: string;
  total: string;
};

type LedgerTableProperties = {
  caption: string;
  rows: readonly LedgerRow[];
};

const columns = [
  { id: 'label', header: 'Poste' },
  { id: 'last', header: 'Dernière période', isNumeric: true },
  { id: 'total', header: 'Cumulé', isNumeric: true },
] as const;

export const LedgerTable = ({ caption, rows }: LedgerTableProperties) => (
  <DataTable
    caption={caption}
    columns={columns}
    rows={rows.map((row) => ({
      id: row.id,
      cells: [row.label, row.last, row.total],
    }))}
  />
);
