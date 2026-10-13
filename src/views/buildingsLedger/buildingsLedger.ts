import type { DataColumn } from '@component/DataTable';
import { companies } from '@game/data';
import { formatCount, formatMoney } from '@game/format';
import type { LedgerReport } from '@game/ledger';
import type { GameState } from '@game/state';

const columns: readonly DataColumn[] = [
  { id: 'company', header: 'Entreprise' },
  { id: 'earned', header: 'Rapporte', isNumeric: true },
  { id: 'items', header: 'Articles', isNumeric: true },
];

// Une ligne par entreprise possédée : ce qu'elle rapporte et les articles
// qu'elle fournit ou vend. Une production ne rapporte rien par elle-même.
const rowsOf = (state: GameState, report: LedgerReport, hasDetail: boolean) =>
  companies
    .filter((company) => (state.companies[company.id] ?? 0) > 0)
    .map((company) => ({
      id: company.id,
      cells:
        company.kind === 'commerce'
          ? [
              company.name,
              hasDetail ? formatMoney(report.salesBy[company.id] ?? 0) : '—',
              `${formatCount(report.stockOut[company.id] ?? 0)} vendus`,
            ]
          : [
              company.name,
              '—',
              `${formatCount(report.stockIn[company.id] ?? 0)} fournis`,
            ],
    }));

// Ce que rapporte chaque entreprise sur une période : la section de Comptes et
// la comptabilité de l'onglet Entreprises.
export const buildingsLedger = (
  state: GameState,
  report: LedgerReport,
  hasDetail: boolean,
) => ({
  title: 'Ce que rapporte chaque entreprise',
  help: 'Une production ne rapporte rien par elle-même : elle fournit le stock que vendent les commerces.',
  columns,
  rows: rowsOf(state, report, hasDetail),
});
