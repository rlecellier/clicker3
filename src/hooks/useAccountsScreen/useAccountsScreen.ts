import { useState } from 'react';
import type { LedgerRow } from '@component/LedgerTable';
import { useGameContext } from '@context/GameContext';
import { companyById } from '@game/companies';
import { companies } from '@game/data';
import { formatCount, formatPeriodDate, formatMoney } from '@game/format';
import { periodReports, totals } from '@game/ledger';
import type { LedgerReport } from '@game/ledger';
import type { GameState } from '@game/state';
import { jobById } from '@game/jobs';
import { courseById } from '@game/study';
import { hasDashboard, upgradeById } from '@game/upgrades';

const TOTAL_ID = 'total';
const unavailableLabel = 'Détail indisponible pour cette période';

type Records = Readonly<Record<string, number>>;

// Une période à afficher : le rapport et ce qu'on sait de son stock.
type Selection = {
  report: LedgerReport;
  // Date de la période ; absente pour le cumul.
  date: string | null;
  isCurrent: boolean;
  // Stock en fin de période (`null` : pas de fin, ou inconnu).
  stockEnd: number | null;
  // Stock en début de période (`null` : inconnu ou sans objet).
  stockStart: number | null;
};

const sum = (records: Records) =>
  Object.values(records).reduce((total, value) => total + value, 0);

// Les périodes migrées d'une ancienne sauvegarde (et le cumul qui les contient)
// ont des ventilations qui ne somment pas à leurs totaux.
const isDetailed = (report: LedgerReport) =>
  sum(report.wagesBy) === report.wages &&
  sum(report.salesBy) === report.sales &&
  sum(report.purchasesBy) === report.purchases &&
  sum(report.studiesBy) === report.studies;

const share = (value: number, whole: number) =>
  whole > 0 ? `${Math.round((value / whole) * 100)} %` : undefined;

const nameOfPurchase = (id: string) =>
  id === 'warehouse'
    ? 'Entrepôt'
    : (companyById(id)?.name ?? upgradeById(id)?.name ?? id);

// Nom d'une source du relevé, ou son id quand elle n'existe plus.
const nameOf = (
  id: string,
  byId: (id: string) => { name: string } | undefined,
) => byId(id)?.name ?? id;

const moneyRow = (
  id: string,
  label: string,
  value: number,
  whole: number,
  isDetail = false,
): LedgerRow => ({
  id,
  label: isDetail ? `· ${label}` : label,
  amount: formatMoney(value),
  share: share(value, whole),
});

const countRow = (id: string, label: string, value: number): LedgerRow => ({
  id,
  label,
  amount: formatCount(value),
});

const unavailableRow = (id: string): LedgerRow => ({
  id,
  label: unavailableLabel,
  amount: '',
});

// Identifiants à lister : ce qu'on possède, plus tout ce qui a rapporté ou
// coûté dans la période.
const idsOf = (owned: readonly string[], records: Records) => [
  ...new Set([...owned, ...Object.keys(records)]),
];

const ownedCompanies = (state: GameState, kind: 'commerce' | 'production') =>
  companies
    .filter(
      (company) =>
        company.kind === kind && (state.companies[company.id] ?? 0) > 0,
    )
    .map((company) => company.id);

// Ligne parente puis une ligne par source, ou la ligne parente seule quand la
// ventilation manque.
const breakdown = (
  parent: LedgerRow,
  details: readonly LedgerRow[],
  hasDetail: boolean,
): LedgerRow[] => (hasDetail ? [parent, ...details] : [parent]);

const incomeRows = (
  state: GameState,
  report: LedgerReport,
  hasDetail: boolean,
): LedgerRow[] => {
  const whole = report.revenue;
  const jobIds = idsOf(
    state.jobId === null ? [] : [state.jobId],
    report.wagesBy,
  );
  const commerceIds = idsOf(ownedCompanies(state, 'commerce'), report.salesBy);
  return [
    ...breakdown(
      moneyRow('wages', 'Salaires', report.wages, whole),
      jobIds.map((id) =>
        moneyRow(
          `wages-${id}`,
          nameOf(id, jobById),
          report.wagesBy[id] ?? 0,
          whole,
          true,
        ),
      ),
      hasDetail,
    ),
    ...breakdown(
      moneyRow('sales', 'Ventes des commerces', report.sales, whole),
      commerceIds.map((id) =>
        moneyRow(
          `sales-${id}`,
          nameOf(id, companyById),
          report.salesBy[id] ?? 0,
          whole,
          true,
        ),
      ),
      hasDetail,
    ),
    moneyRow('surplus', 'Vente du surplus', report.surplus, whole),
    ...(report.otherIncome === 0
      ? []
      : [
          moneyRow('otherIncome', 'Autres recettes', report.otherIncome, whole),
        ]),
    moneyRow('revenue', 'Total des recettes', report.revenue, whole),
    moneyRow('net', 'Solde (recettes moins dépenses)', report.net, 0),
    ...(hasDetail ? [] : [unavailableRow('unavailable-income')]),
  ];
};

const expenseRows = (report: LedgerReport, hasDetail: boolean): LedgerRow[] => {
  const whole = report.expenses;
  return [
    moneyRow('rent', 'Loyer', report.rent, whole),
    moneyRow('living', 'Train de vie', report.living, whole),
    moneyRow('charges', 'Charges des entreprises', report.charges, whole),
    moneyRow('payroll', 'Salaires versés', report.payroll, whole),
    moneyRow('interest', 'Intérêts', report.interest, whole),
    ...breakdown(
      moneyRow('purchases', 'Achats', report.purchases, whole),
      Object.entries(report.purchasesBy).map(([id, value]) =>
        moneyRow(`purchases-${id}`, nameOfPurchase(id), value, whole, true),
      ),
      hasDetail,
    ),
    ...breakdown(
      moneyRow('studies', 'Études', report.studies, whole),
      Object.entries(report.studiesBy).map(([id, value]) =>
        moneyRow(`studies-${id}`, nameOf(id, courseById), value, whole, true),
      ),
      hasDetail,
    ),
    ...(report.otherExpenses === 0
      ? []
      : [
          moneyRow(
            'otherExpenses',
            'Autres dépenses',
            report.otherExpenses,
            whole,
          ),
        ]),
    moneyRow('expenses', 'Total des dépenses', report.expenses, whole),
    ...(hasDetail ? [] : [unavailableRow('unavailable-expenses')]),
  ];
};

const stockRows = (
  state: GameState,
  selection: Selection,
  hasDetail: boolean,
): LedgerRow[] => {
  const { report, stockStart, stockEnd } = selection;
  const productionIds = idsOf(
    ownedCompanies(state, 'production'),
    report.stockIn,
  );
  const commerceIds = idsOf(ownedCompanies(state, 'commerce'), report.stockOut);
  const outIds = commerceIds.filter((id) => id !== 'surplus');
  const { isCurrent } = selection;
  return [
    ...(stockStart === null || !(hasDetail || isCurrent)
      ? []
      : [countRow('stockStart', 'Stock au début', stockStart)]),
    countRow('stockProduced', 'Entrées (production)', report.stockProduced),
    ...productionIds.map((id) =>
      countRow(
        `stockIn-${id}`,
        `· ${nameOf(id, companyById)}`,
        report.stockIn[id] ?? 0,
      ),
    ),
    countRow('stockSold', 'Sorties (ventes)', report.stockSold),
    ...outIds.map((id) =>
      countRow(
        `stockOut-${id}`,
        `· ${nameOf(id, companyById)}`,
        report.stockOut[id] ?? 0,
      ),
    ),
    countRow(
      'stockOut-surplus',
      '· Vente du surplus',
      report.stockOut.surplus ?? 0,
    ),
    countRow('stockLost', 'Perdu (entrepôt plein)', report.stockLost),
    ...(stockEnd === null || !(hasDetail || isCurrent)
      ? []
      : [
          {
            id: 'stockEnd',
            label: isCurrent ? 'Stock actuel / capacité' : 'Stock à la fin',
            amount: isCurrent
              ? `${formatCount(stockEnd)} / ${formatCount(state.stockCapacity)}`
              : formatCount(stockEnd),
          },
        ]),
  ];
};

// Une ligne par entreprise possédée : ce qu'elle rapporte et les articles
// qu'elle fournit ou vend. Une production ne rapporte rien par elle-même.
const buildingRows = (
  state: GameState,
  report: LedgerReport,
  hasDetail: boolean,
) =>
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

const reputationRows = (report: LedgerReport): LedgerRow[] => [
  countRow('reputationGained', 'Réputation gagnée', report.reputationGained),
  countRow('reputationLost', 'Réputation perdue', report.reputationLost),
  countRow('reputationSpent', 'Réputation dépensée', report.reputationSpent),
];

// Les périodes proposées : en cours, terminées (3 au plus), cumul.
const selectionsOf = (state: GameState) => {
  const [current, ...past] = periodReports(state);
  const entries: { id: string; label: string; selection: Selection }[] = [];
  if (current !== undefined) {
    entries.push({
      id: 'current',
      label: 'Période en cours',
      selection: {
        report: current,
        date: formatPeriodDate(state, current.period),
        isCurrent: true,
        stockStart: current.stockStart,
        stockEnd: state.stock,
      },
    });
  }
  for (const report of past) {
    const ago = state.period - report.period;
    entries.push({
      id: `past-${ago}`,
      label: `Il y a ${ago} mois`,
      selection: {
        report,
        date: formatPeriodDate(state, report.period),
        isCurrent: false,
        stockStart: report.stockStart,
        stockEnd: report.stockEnd,
      },
    });
  }
  entries.push({
    id: TOTAL_ID,
    label: 'Cumulé',
    selection: {
      report: totals(state),
      date: null,
      isCurrent: false,
      stockStart: null,
      stockEnd: null,
    },
  });
  return entries;
};

// Comptes : choix de la période, puis argent, stock et entreprises prêts à
// afficher. La période choisie est un état d'interface, pas du jeu.
export const useAccountsScreen = () => {
  const { state } = useGameContext();
  const [chosen, setChosen] = useState('current');

  const entries = selectionsOf(state);
  const entry =
    entries.find((candidate) => candidate.id === chosen) ?? entries[0];
  if (entry === undefined) {
    throw new Error('Aucune période à afficher');
  }
  const { report, date } = entry.selection;
  const hasDetail = isDetailed(report);
  const hasBoard = hasDashboard(state);

  return {
    tabs: entries.map(({ id, label }) => ({ id, label })),
    selected: entry.id,
    select: setChosen,
    heading:
      date === null ? 'Depuis le début de la partie' : `Période de ${date}`,
    // Sans le tableau de bord : l'argent seul.
    basic: {
      caption: 'Comptes (version simplifiée)',
      rows: [
        moneyRow('revenue', 'Recettes', report.revenue, 0),
        moneyRow('expenses', 'Dépenses', report.expenses, 0),
        moneyRow('net', 'Solde', report.net, 0),
      ],
    },
    // Avec le tableau de bord : le détail, section par section.
    dashboard: hasBoard
      ? {
          income: {
            title: 'D’où vient l’argent ?',
            help: 'Salaires de vos emplois et ventes de vos commerces. Les commerces vendent tout le stock, production de la période comprise, dans la limite de leur capacité.',
            rows: incomeRows(state, report, hasDetail),
          },
          expenses: {
            title: 'Où part l’argent ?',
            help: 'Le loyer, les salaires versés et les intérêts tombent à chaque période ; les achats et les études sont ce que vous décidez de payer.',
            rows: expenseRows(report, hasDetail),
          },
          stock: {
            title: 'Comment le stock a-t-il bougé ?',
            help: 'Les entreprises de production remplissent le stock, les commerces le vident. Seul l’invendu au-delà de la capacité de l’entrepôt est perdu, après les ventes.',
            rows: stockRows(state, entry.selection, hasDetail),
          },
          buildings: {
            title: 'Ce que rapporte chaque entreprise',
            help: 'Une production ne rapporte rien par elle-même : elle fournit le stock que vendent les commerces.',
            columns: [
              { id: 'company', header: 'Entreprise' },
              { id: 'earned', header: 'Rapporte', isNumeric: true },
              { id: 'items', header: 'Articles', isNumeric: true },
            ] as const,
            rows: buildingRows(state, report, hasDetail),
          },
          reputation: {
            title: 'Et la réputation ?',
            help: 'Gagnée en travaillant et en vendant, perdue en cas de rupture ou de découvert, dépensée pour débloquer emplois et quartiers.',
            rows: reputationRows(report),
          },
        }
      : null,
  };
};
