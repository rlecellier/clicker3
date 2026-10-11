import type { ReactNode } from 'react';
import styles from './DataTable.module.css';

export type DataColumn = {
  id: string;
  header: string;
  // Chiffres alignés à droite.
  isNumeric?: boolean;
};

type DataTableProperties = {
  caption: string;
  columns: readonly DataColumn[];
  // Une ligne = une cellule par colonne, dans l'ordre.
  rows: readonly { id: string; cells: readonly ReactNode[] }[];
};

export const DataTable = ({ caption, columns, rows }: DataTableProperties) => (
  <table className={styles.table}>
    <caption className={styles.caption}>{caption}</caption>
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            scope="col"
            className={column.isNumeric ? styles.numeric : undefined}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr key={row.id}>
          {row.cells.map((cell, index) => (
            <td
              key={columns[index]?.id ?? index}
              className={columns[index]?.isNumeric ? styles.numeric : undefined}
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
