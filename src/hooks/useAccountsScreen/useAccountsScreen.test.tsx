import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { GameProvider } from '@context/GameContext';
import { startState } from '@game/data';
import { emptyFigures } from '@game/ledger';
import { createMemoryStorage, serialize } from '@game/save';
import type { GameState, LedgerFigures } from '@game/state';
import { useAccountsScreen } from './useAccountsScreen';

const setup = (state: GameState) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <GameProvider
        storage={createMemoryStorage(serialize(state, 0))}
        now={() => 0}
      >
        {children}
      </GameProvider>
    </MemoryRouter>
  );
  return renderHook(() => useAccountsScreen(), { wrapper });
};

const detailed: LedgerFigures = {
  ...emptyFigures(),
  sales: 30,
  salesBy: { boutique: 30 },
  purchases: 70,
  purchasesBy: { atelier: 50, warehouse: 20 },
  stockProduced: 10,
  stockSold: 6,
  stockIn: { atelier: 10 },
  stockOut: { boutique: 6 },
  stockStart: 2,
  stockEnd: 6,
};

const played: GameState = {
  ...startState,
  period: 5,
  stock: 4,
  stockCapacity: 20,
  companies: { ...startState.companies, atelier: 1, boutique: 1 },
  ledger: {
    ...startState.ledger,
    history: [
      { period: 4, figures: detailed },
      { period: 3, figures: emptyFigures() },
    ],
  },
};

const board: GameState = { ...played, upgrades: ['tableau-de-bord'] };

const ids = (rows: readonly { id: string }[] | undefined) =>
  rows?.map((row) => row.id) ?? [];

describe('useAccountsScreen', () => {
  it('propose la période en cours, les périodes terminées qui existent, puis le cumul', () => {
    expect(setup(startState).result.current.tabs.map((tab) => tab.id)).toEqual([
      'current',
      'total',
    ]);
    expect(setup(played).result.current.tabs.map((tab) => tab.label)).toEqual([
      'Période en cours',
      'Il y a 1 mois',
      'Il y a 2 mois',
      'Cumulé',
    ]);
  });

  it('ne montre que l’argent tant que le tableau de bord n’est pas acheté', () => {
    const { result } = setup(startState);
    expect(result.current.dashboard).toBeNull();
    expect(ids(result.current.basic.rows)).toEqual([
      'revenue',
      'expenses',
      'net',
    ]);
  });

  it('change de période sans toucher à l’état du jeu', () => {
    const { result } = setup(board);
    act(() => {
      result.current.select('past-1');
    });
    expect(result.current.selected).toBe('past-1');
    const rows = result.current.dashboard?.income.rows;
    expect(rows?.find((row) => row.id === 'sales')?.amount).toContain('30');
  });

  it('donne la part de chaque achat dans les dépenses', () => {
    const { result } = setup(board);
    act(() => {
      result.current.select('past-1');
    });
    const rows = result.current.dashboard?.expenses.rows;
    expect(ids(rows)).toContain('purchases-atelier');
    expect(ids(rows)).toContain('purchases-warehouse');
    expect(rows?.find((row) => row.id === 'purchases-atelier')?.share).toBe(
      '71 %',
    );
    expect(rows?.find((row) => row.id === 'purchases-warehouse')?.label).toBe(
      '· Entrepôt',
    );
  });

  it('affiche les charges des entreprises parmi les dépenses', () => {
    const withCharges: GameState = {
      ...board,
      ledger: {
        ...board.ledger,
        history: [
          {
            period: 4,
            figures: { ...detailed, charges: 1460, living: 540 },
          },
        ],
      },
    };
    const { result } = setup(withCharges);
    act(() => {
      result.current.select('past-1');
    });
    const row = result.current.dashboard?.expenses.rows.find(
      (candidate) => candidate.id === 'charges',
    );
    expect(row?.label).toBe('Charges des entreprises');
    expect(row?.amount).toContain('1');
  });

  it('garde un commerce possédé sans vente à zéro et ignore ceux qu’on n’a pas', () => {
    const { result } = setup(board);
    const rows = result.current.dashboard?.income.rows;
    expect(rows?.find((row) => row.id === 'sales-boutique')?.amount).toContain(
      '0',
    );
    expect(ids(rows)).not.toContain('sales-kiosque');
  });

  it('suit le stock : début, entrées et sorties par entreprise, fin', () => {
    const { result } = setup(board);
    act(() => {
      result.current.select('past-1');
    });
    const rows = result.current.dashboard?.stock.rows;
    expect(ids(rows)).toEqual([
      'stockStart',
      'stockProduced',
      'stockIn-atelier',
      'stockSold',
      'stockOut-boutique',
      'stockOut-surplus',
      'stockLost',
      'stockEnd',
    ]);
  });

  it('prend le stock actuel et la capacité pour la période en cours', () => {
    const { result } = setup(board);
    const end = result.current.dashboard?.stock.rows.find(
      (row) => row.id === 'stockEnd',
    );
    expect(end?.amount).toBe('4 / 20');
  });

  it('annonce un détail indisponible quand la ventilation ne somme pas', () => {
    const migrated: GameState = {
      ...board,
      ledger: {
        ...played.ledger,
        history: [
          {
            period: 4,
            figures: { ...emptyFigures(), sales: 50, purchases: 10 },
          },
        ],
      },
    };
    const { result } = setup(migrated);
    act(() => {
      result.current.select('past-1');
    });
    const income = result.current.dashboard?.income.rows;
    expect(ids(income)).toContain('unavailable-income');
    expect(ids(income)).not.toContain('sales-boutique');
    expect(ids(result.current.dashboard?.stock.rows)).not.toContain(
      'stockStart',
    );
    // Les totaux restent ceux du ledger.
    expect(income?.find((row) => row.id === 'revenue')?.amount).toContain('50');
  });
});
