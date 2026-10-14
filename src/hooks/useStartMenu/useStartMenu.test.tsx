import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { useStartMenu } from './useStartMenu';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/jeu/vie']}>{children}</MemoryRouter>
);

const renderMenu = () =>
  renderHook(() => ({ menu: useStartMenu(), navigate: useNavigate() }), {
    wrapper,
  });

describe('useStartMenu', () => {
  it('est fermé au départ et bascule au tap sur Démarrer', () => {
    const { result } = renderMenu();
    expect(result.current.menu.isOpen).toBe(false);
    act(() => result.current.menu.toggle());
    expect(result.current.menu.isOpen).toBe(true);
    act(() => result.current.menu.toggle());
    expect(result.current.menu.isOpen).toBe(false);
  });

  it('se ferme avec Échap, pas avec une autre touche', () => {
    const { result } = renderMenu();
    act(() => result.current.menu.toggle());
    act(() => {
      dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(result.current.menu.isOpen).toBe(true);
    act(() => {
      dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.menu.isOpen).toBe(false);
  });

  it('se ferme quand on change d’onglet, sans se rouvrir au retour', () => {
    const { result } = renderMenu();
    act(() => result.current.menu.toggle());
    act(() => result.current.navigate('/jeu/emploi'));
    expect(result.current.menu.isOpen).toBe(false);
    act(() => result.current.navigate('/jeu/vie'));
    expect(result.current.menu.isOpen).toBe(false);
  });
});
