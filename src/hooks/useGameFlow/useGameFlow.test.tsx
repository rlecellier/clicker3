import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider } from '@context/GameContext';
import { startState } from '@game/data';
import { createMemoryStorage, serialize } from '@game/save';
import { screenOf, useGameFlow } from './useGameFlow';

const screenWith = (saved: string | null) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameProvider storage={createMemoryStorage(saved)} now={() => 0}>
      {children}
    </GameProvider>
  );
  return renderHook(() => useGameFlow(), { wrapper }).result.current;
};

describe('useGameFlow', () => {
  it('reste sur le titre sans sauvegarde', () => {
    expect(screenWith(null)).toBe('title');
  });

  it('revient dans la partie sauvegardée', () => {
    expect(screenWith(serialize(startState, 0))).toBe('game');
  });

  it('va à l’écran de fin quand le personnage est mort', () => {
    const dead = { ...startState, status: 'dead' } as const;
    expect(screenWith(serialize(dead, 0))).toBe('end');
  });
});

describe('screenOf', () => {
  it('montre l’absence avant la fin', () => {
    expect(screenOf({ hasSave: true, hasAbsence: true, isDead: true })).toBe(
      'absence',
    );
    expect(screenOf({ hasSave: true, hasAbsence: false, isDead: true })).toBe(
      'end',
    );
  });
});
