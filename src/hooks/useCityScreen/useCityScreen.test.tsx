import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider } from '@context/GameContext';
import { createMemoryStorage } from '@game/save';
import { useCityScreen } from './useCityScreen';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider storage={createMemoryStorage()} now={() => 0}>
    {children}
  </GameProvider>
);

describe('useCityScreen', () => {
  it('ouvre les Tilleuls, verrouille les autres et choisit la fiche', () => {
    const { result } = renderHook(() => useCityScreen(), { wrapper });
    const locked = result.current.districts.map(
      (district) => district.isLocked,
    );
    expect(locked).toEqual([false, true, true, true]);
    expect(result.current.districts[1]?.conditions.length).toBeGreaterThan(0);
    expect(result.current.sheet?.name).toBe('Les Tilleuls');
    expect(result.current.sheet?.badge).toBe('Ouvert');
    expect(result.current.city.map((gauge) => gauge.id)).toEqual([
      'pollution',
      'inequality',
    ]);

    act(() => {
      result.current.select('hauts-fourneaux');
    });
    expect(result.current.sheet?.name).toBe('Les Hauts-Fourneaux');
    expect(result.current.sheet?.isDisabled).toBe(true);
    expect(result.current.sheet?.gauges).toEqual([]);
    expect(
      result.current.districts.find((district) => district.isSelected)?.id,
    ).toBe('hauts-fourneaux');
  });
});
