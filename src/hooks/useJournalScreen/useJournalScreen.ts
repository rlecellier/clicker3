import { useState } from 'react';
import type { EventLogEntry } from '@component/EventLog';
import type { LedgerRow } from '@component/LedgerTable';
import { useGameContext } from '@context/GameContext';
import { formatCount, formatDate, formatMoney } from '@game/format';
import { lastPeriodReport, totals } from '@game/ledger';
import type { LedgerReport } from '@game/ledger';
import type { JournalEntry } from '@game/state';
import { dateOf } from '@game/time';
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

// Une fois le « Tableau de bord » acheté : le détail et les flux.
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
  money('otherExpenses', '· Autres dépenses', (report) => report.otherExpenses),
  money('net', 'Solde', (report) => report.net),
  count('stockProduced', 'Stock produit', (report) => report.stockProduced),
  count('stockSold', 'Stock vendu', (report) => report.stockSold),
  count('stockLost', 'Stock perdu', (report) => report.stockLost),
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

const keyOf = (entry: JournalEntry) => `${entry.period}-${entry.id}`;

// Courrier (événements) et comptabilité, prêts à afficher.
export const useJournalScreen = () => {
  const { state } = useGameContext();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const dateLabel = (entry: JournalEntry) =>
    formatDate(dateOf({ ...state, period: entry.period }));

  const entries: EventLogEntry[] = state.events.toReversed().map((entry) => ({
    id: keyOf(entry),
    date: dateLabel(entry),
    text: entry.text,
    isNew: entry.period === state.period,
  }));

  // Le dernier message, tant qu'il date de la période en cours et n'est pas fermé.
  const latest = state.events.at(-1);
  const toast =
    latest !== undefined &&
    latest.period === state.period &&
    keyOf(latest) !== dismissedKey
      ? {
          date: dateLabel(latest),
          text: latest.text,
          dismiss: () => {
            setDismissedKey(keyOf(latest));
          },
        }
      : null;

  const hasBoard = hasDashboard(state);
  const last = lastPeriodReport(state);
  const total = totals(state);
  const rows: LedgerRow[] = (hasBoard ? dashboardLines : basicLines).map(
    (line) => ({
      id: line.id,
      label: line.label,
      last: line.format(line.value(last)),
      total: line.format(line.value(total)),
    }),
  );

  return {
    entries,
    toast,
    ledger: {
      caption: hasBoard ? 'Tableau de bord' : 'Comptes (version simplifiée)',
      rows,
    },
  };
};
