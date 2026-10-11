import { act, renderHook } from '@testing-library/react';
import { HOLD_REPEAT_MS, LONG_PRESS_MS, useHoldRepeat } from './useHoldRepeat';

const setup = (options: { withLongPress?: boolean; isDisabled?: boolean }) => {
  const onClick = vi.fn();
  const onLongPress = vi.fn();
  const hook = renderHook(
    (props: { isDisabled: boolean }) =>
      useHoldRepeat({
        onClick,
        onLongPress: options.withLongPress === true ? onLongPress : undefined,
        isDisabled: props.isDisabled,
      }),
    { initialProps: { isDisabled: options.isDisabled === true } },
  );
  return { ...hook, onClick, onLongPress };
};

describe('useHoldRepeat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('un appui bref fait un seul clic, le clic natif est ignoré', () => {
    const { result, onClick } = setup({});
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(HOLD_REPEAT_MS - 1);
      result.current.press.onPointerUp();
    });
    act(() => {
      result.current.onClick();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('un clic sans appui (clavier) reste un clic ordinaire', () => {
    const { result, onClick } = setup({});
    act(() => {
      result.current.onClick();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('un clic part à l’appui, puis un toutes les 250 ms', () => {
    const { result, onClick } = setup({});
    act(() => {
      result.current.press.onPointerDown();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onClick).toHaveBeenCalledTimes(5);
  });

  it('la répétition s’arrête au relâchement', () => {
    const { result, onClick } = setup({});
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(HOLD_REPEAT_MS);
      result.current.press.onPointerUp();
      vi.advanceTimersByTime(2000);
    });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('la répétition s’arrête à la sortie du bouton et ne laisse pas de clic ignoré', () => {
    const { result, onClick } = setup({});
    act(() => {
      result.current.press.onPointerDown();
      result.current.press.onPointerLeave();
      vi.advanceTimersByTime(2000);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    act(() => {
      result.current.onClick();
    });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('la répétition s’arrête à l’annulation du geste', () => {
    const { result, onClick } = setup({});
    act(() => {
      result.current.press.onPointerDown();
      result.current.press.onPointerCancel();
      vi.advanceTimersByTime(2000);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('rien ne part quand le bouton est indisponible', () => {
    const { result, onClick } = setup({ isDisabled: true });
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(2000);
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('la répétition s’arrête quand le bouton devient indisponible', () => {
    const { result, rerender, onClick } = setup({});
    act(() => {
      result.current.press.onPointerDown();
    });
    rerender({ isDisabled: true });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('la répétition s’arrête au démontage', () => {
    const { result, unmount, onClick } = setup({ withLongPress: true });
    act(() => {
      result.current.press.onPointerDown();
    });
    unmount();
    vi.advanceTimersByTime(2000);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('seul le bouton principal répète', () => {
    const { result, onClick } = setup({});
    act(() => {
      result.current.press.onPointerDown({ button: 2 });
      vi.advanceTimersByTime(1000);
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('l’appui long bascule une seule fois, sans arrêter la répétition', () => {
    const { result, onClick, onLongPress } = setup({ withLongPress: true });
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(LONG_PRESS_MS - 1);
    });
    expect(onLongPress).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
    // 1 clic à l'appui, puis un toutes les 250 ms pendant 3,5 s.
    expect(onClick).toHaveBeenCalledTimes(15);
  });

  it('un second appui long bascule de nouveau, un appui bref ne bascule pas', () => {
    const { result, onLongPress } = setup({ withLongPress: true });
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(HOLD_REPEAT_MS);
      result.current.press.onPointerUp();
    });
    expect(onLongPress).not.toHaveBeenCalled();
    for (let turn = 1; turn <= 2; turn += 1) {
      act(() => {
        result.current.press.onPointerDown();
        vi.advanceTimersByTime(LONG_PRESS_MS + 100);
        result.current.press.onPointerUp();
      });
      expect(onLongPress).toHaveBeenCalledTimes(turn);
    }
  });

  it('sortir du bouton avant 500 ms annule l’appui long', () => {
    const { result, onLongPress } = setup({ withLongPress: true });
    act(() => {
      result.current.press.onPointerDown();
      result.current.press.onPointerLeave();
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    });
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('le clavier maintenu ne répète pas', () => {
    const { result } = setup({});
    const preventDefault = vi.fn();
    result.current.press.onKeyDown({
      key: 'Enter',
      repeat: true,
      preventDefault,
    });
    expect(preventDefault).toHaveBeenCalledTimes(1);
    result.current.press.onKeyDown({
      key: 'Enter',
      repeat: false,
      preventDefault,
    });
    result.current.press.onKeyDown({ key: 'a', repeat: true, preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
