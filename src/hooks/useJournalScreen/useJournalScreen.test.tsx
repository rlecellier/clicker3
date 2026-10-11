import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider } from '@context/GameContext';
import { startState } from '@game/data';
import { createMemoryStorage, serialize } from '@game/save';
import type { GameState } from '@game/state';
import { useJournalScreen } from './useJournalScreen';

const setup = (state: GameState) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameProvider
      storage={createMemoryStorage(serialize(state, 0))}
      now={() => 0}
    >
      {children}
    </GameProvider>
  );
  return renderHook(() => useJournalScreen(), { wrapper });
};

describe('useJournalScreen', () => {
  it('ne montre que l’argent tant que le tableau de bord n’est pas acheté', () => {
    const { result } = setup(startState);
    expect(result.current.ledger.rows.map((row) => row.id)).toEqual([
      'revenue',
      'expenses',
      'net',
    ]);
  });

  it('détaille les flux avec le tableau de bord', () => {
    const { result } = setup({
      ...startState,
      upgrades: ['tableau-de-bord'],
    });
    const ids = result.current.ledger.rows.map((row) => row.id);
    expect(ids).toContain('reputationGained');
    expect(ids).not.toContain('stockProduced');
  });

  it('sépare le stock de la comptabilité, derrière le tableau de bord', () => {
    expect(setup(startState).result.current.stock).toBeNull();
    const { result } = setup({
      ...startState,
      upgrades: ['tableau-de-bord'],
      stock: 4,
      stockCapacity: 20,
      companies: { ...startState.companies, atelier: 1, boutique: 1 },
      ledger: {
        ...startState.ledger,
        total: {
          ...startState.ledger.total,
          stockProduced: 10,
          stockSold: 6,
          stockIn: { atelier: 10 },
          stockOut: { boutique: 5, surplus: 1 },
        },
      },
    });
    expect(result.current.stock?.caption).toBe('Stock : 4 / 20');
    const totals = Object.fromEntries(
      result.current.stock?.rows.map((row) => [row.id, row.total]) ?? [],
    );
    expect(totals['stockIn-atelier']).toBe('10');
    expect(totals['stockOut-boutique']).toBe('5');
    expect(totals['stockOut-surplus']).toBe('1');
  });
});
