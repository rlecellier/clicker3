import { act, renderHook } from '@testing-library/react';
import { LONG_PRESS_MS } from '@hook/useHoldRepeat';
import { useTapOrHold } from './useTapOrHold';

const setup = () => {
  const onTap = vi.fn();
  const onHold = vi.fn();
  const { result } = renderHook(() => useTapOrHold());
  const button = result.current({ onTap, onHold });
  return { button, onTap, onHold };
};

describe('useTapOrHold', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('au toucher, un appui court fait l’action une fois, pas le long', () => {
    const { button, onTap, onHold } = setup();
    act(() => {
      button.press.onPointerDown({ button: 0 });
      vi.advanceTimersByTime(LONG_PRESS_MS - 100);
      // La séquence d’un doigt : pointerup, pointerleave, puis click.
      button.press.onPointerUp();
      button.press.onPointerLeave();
      button.onClick();
    });
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onHold).not.toHaveBeenCalled();
  });

  it('au toucher, un appui long fait l’appui long, pas l’action', () => {
    const { button, onTap, onHold } = setup();
    act(() => {
      button.press.onPointerDown({ button: 0 });
      vi.advanceTimersByTime(LONG_PRESS_MS + 100);
    });
    expect(onHold).toHaveBeenCalledTimes(1);
    act(() => {
      button.press.onPointerUp();
      button.press.onPointerLeave();
      button.onClick();
    });
    expect(onTap).not.toHaveBeenCalled();
    expect(onHold).toHaveBeenCalledTimes(1);
  });

  it('à la souris, un clic franc fait l’action et un appui long fait l’appui long', () => {
    const { button, onTap, onHold } = setup();
    act(() => {
      button.press.onPointerDown({ button: 0 });
      button.press.onPointerUp();
      button.onClick();
    });
    expect(onTap).toHaveBeenCalledTimes(1);
    act(() => {
      button.press.onPointerDown({ button: 0 });
      vi.advanceTimersByTime(LONG_PRESS_MS + 100);
      button.press.onPointerUp();
      button.onClick();
    });
    expect(onHold).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('après un appui long, le tap suivant compte à nouveau', () => {
    const { button, onTap } = setup();
    act(() => {
      button.press.onPointerDown({ button: 0 });
      vi.advanceTimersByTime(LONG_PRESS_MS + 100);
      button.press.onPointerUp();
      // Aucun clic ne suit (le doigt a glissé hors du bouton).
      vi.advanceTimersByTime(1000);
      button.onClick();
    });
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('sortir doigt posé annule l’appui long', () => {
    const { button, onHold } = setup();
    act(() => {
      button.press.onPointerDown({ button: 0 });
      vi.advanceTimersByTime(LONG_PRESS_MS - 100);
      button.press.onPointerLeave();
      vi.advanceTimersByTime(1000);
    });
    expect(onHold).not.toHaveBeenCalled();
  });

  it('le clavier fait l’action, et un autre bouton que le principal n’y touche pas', () => {
    const { button, onTap, onHold } = setup();
    act(() => {
      button.onClick();
    });
    expect(onTap).toHaveBeenCalledTimes(1);
    act(() => {
      button.press.onPointerDown({ button: 2 });
      vi.advanceTimersByTime(LONG_PRESS_MS + 100);
    });
    expect(onHold).not.toHaveBeenCalled();
  });
});
