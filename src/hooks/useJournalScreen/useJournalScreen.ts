import type { LedgerRow } from '@component/LedgerTable';
import { useGameContext } from '@context/GameContext';
import { companies } from '@game/data';
import { formatCount, formatMoney } from '@game/format';
import { lastPeriodReport, totals } from '@game/ledger';
import type { LedgerReport } from '@game/ledger';
import type { GameState } from '@game/state';
import { hasDashboard } from '@game/upgrades';

type Line = {
  id: string;
  label: string;
  value: (report: LedgerReport) => number;
  format: (value: number) => string;
};

const money = (id: string, label: string, value: Line['value']): Line => ({
  id,
  label,
  value,
  format: formatMoney,
});

const count = (id: string, label: string, value: Line['value']): Line => ({
  id,
  label,
  value,
  format: formatCount,
});

// Version minimale, toujours là : l'argent seul.
const basicLines: Line[] = [
  money('revenue', 'Recettes', (report) => report.revenue),
  money('expenses', 'Dépenses', (report) => report.expenses),
  money('net', 'Solde', (report) => report.net),
];

// Une fois le « Tableau de bord » acheté : le détail de l'argent et la réputation.
const dashboardLines: Line[] = [
  money('revenue', 'Recettes', (report) => report.revenue),
  money('wages', '· Salaires', (report) => report.wages),
  money('sales', '· Ventes', (report) => report.sales),
  money('surplus', '· Vente du surplus', (report) => report.surplus),
  money('otherIncome', '· Autres recettes', (report) => report.otherIncome),
  money('expenses', 'Dépenses', (report) => report.expenses),
  money('rent', '· Loyer', (report) => report.rent),
  money('payroll', '· Salaires versés', (report) => report.payroll),
  money('purchases', '· Achats', (report) => report.purchases),
  money('studies', '· Études', (report) => report.studies),
  money('interest', '· Intérêts', (report) => report.interest),
  money('otherExpenses', '· Autres dépenses', (report) => report.otherExpenses),
  money('net', 'Solde', (report) => report.net),
  count(
    'reputationGained',
    'Réputation gagnée',
    (report) => report.reputationGained,
  ),
  count(
    'reputationLost',
    'Réputation perdue',
    (report) => report.reputationLost,
  ),
  count(
    'reputationSpent',
    'Réputation dépensée',
    (report) => report.reputationSpent,
  ),
];

// Récap du stock : ce qui entre (production de chaque entreprise) et ce qui
// sort (ventes de chaque commerce, vente du surplus), puis ce qui est perdu.
const stockLines = (state: GameState): Line[] => {
  const isKnown = (id: string) =>
    (state.companies[id] ?? 0) > 0 ||
    (state.ledger.total.stockIn[id] ?? 0) > 0 ||
    (state.ledger.total.stockOut[id] ?? 0) > 0;
  const detail = (
    id: string,
    label: string,
    side: 'stockIn' | 'stockOut',
  ): Line =>
    count(`${side}-${id}`, `· ${label}`, (report) => report[side][id] ?? 0);
  return [
    count('stockProduced', 'Entrées', (report) => report.stockProduced),
    ...companies
      .filter((company) => company.kind === 'production' && isKnown(company.id))
      .map((company) => detail(company.id, company.name, 'stockIn')),
    count('stockSold', 'Sorties', (report) => report.stockSold),
    ...companies
      .filter((company) => company.kind === 'commerce' && isKnown(company.id))
      .map((company) => detail(company.id, company.name, 'stockOut')),
    detail('surplus', 'Vente du surplus', 'stockOut'),
    count(
      'stockLost',
      'Production perdue (entrepôt plein)',
      (report) => report.stockLost,
    ),
  ];
};

// Comptabilité et stock, prêts à afficher.
export const useJournalScreen = () => {
  const { state } = useGameContext();

  const hasBoard = hasDashboard(state);
  const last = lastPeriodReport(state);
  const total = totals(state);
  const toRows = (lines: Line[]): LedgerRow[] =>
    lines.map((line) => ({
      id: line.id,
      label: line.label,
      last: line.format(line.value(last)),
      total: line.format(line.value(total)),
    }));
  const rows = toRows(hasBoard ? dashboardLines : basicLines);

  return {
    ledger: {
      caption: hasBoard ? 'Tableau de bord' : 'Comptes (version simplifiée)',
      rows,
    },
    // Gestion du stock : seulement avec le tableau de bord.
    stock: hasBoard
      ? {
          caption: `Stock : ${formatCount(state.stock)} / ${formatCount(state.stockCapacity)}`,
          rows: toRows(stockLines(state)),
        }
      : null,
  };
};
