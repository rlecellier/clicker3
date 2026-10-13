import { renderHook } from '@testing-library/react';
import { gameTabs } from '@hook/useGameTabs';
import { shortcutTable } from './shortcuts';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

const press = (key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  (document.activeElement ?? document.body).dispatchEvent(event);
  return event;
};

const setup = () => {
  const handlers = { openTab: vi.fn(), work: vi.fn(), study: vi.fn() };
  renderHook(() => {
    useKeyboardShortcuts(handlers);
  });
  return handlers;
};

const expectNothing = (handlers: ReturnType<typeof setup>) => {
  expect(handlers.openTab).not.toHaveBeenCalled();
  expect(handlers.work).not.toHaveBeenCalled();
  expect(handlers.study).not.toHaveBeenCalled();
};

describe('useKeyboardShortcuts', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('1 à 9 ouvrent les onglets dans l’ordre de la sidebar', () => {
    const handlers = setup();
    for (const index of gameTabs.keys()) {
      press(String(index + 1));
    }
    expect(handlers.openTab.mock.calls.map(([tab]) => tab)).toEqual(
      gameTabs.map((tab) => tab.id),
    );
  });

  it('T travaille et E étudie, majuscule comprise', () => {
    const handlers = setup();
    press('t');
    press('T');
    press('e');
    expect(handlers.work).toHaveBeenCalledTimes(2);
    expect(handlers.study).toHaveBeenCalledTimes(1);
  });

  it('n’a aucun raccourci d’Espace, d’Entrée, d’achat ni de vente', () => {
    expect(
      Object.keys(shortcutTable).toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', 'e', 't']);
    const handlers = setup();
    press(' ');
    press('Enter');
    press('0');
    expectNothing(handlers);
  });

  it('ignore une touche maintenue enfoncée', () => {
    const handlers = setup();
    press('t', { repeat: true });
    expectNothing(handlers);
  });

  it.each(['ctrlKey', 'altKey', 'metaKey'])(
    'ignore une touche de modification (%s)',
    (modifier) => {
      const handlers = setup();
      press('5', { [modifier]: true });
      press('t', { [modifier]: true });
      expectNothing(handlers);
    },
  );

  it('ignore les touches tapées dans un champ de saisie', () => {
    const handlers = setup();
    const input = document.createElement('input');
    document.body.append(input);
    input.focus();
    press('t');
    press('5');
    expectNothing(handlers);
  });

  it('ignore les touches quand un menu est ouvert', () => {
    const handlers = setup();
    const menu = document.createElement('div');
    menu.setAttribute('role', 'menu');
    document.body.append(menu);
    press('e');
    expectNothing(handlers);
  });

  it('ignore les touches pendant une confirmation', () => {
    const handlers = setup();
    const prompt = document.createElement('div');
    prompt.setAttribute('role', 'alertdialog');
    document.body.append(prompt);
    press('t');
    expectNothing(handlers);
  });

  it('cesse d’écouter au démontage', () => {
    const handlers = { openTab: vi.fn(), work: vi.fn(), study: vi.fn() };
    const { unmount } = renderHook(() => {
      useKeyboardShortcuts(handlers);
    });
    unmount();
    press('t');
    expectNothing(handlers);
  });
});
