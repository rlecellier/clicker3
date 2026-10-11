import { act, renderHook } from '@testing-library/react';
import { LONG_PRESS_MS, useLongPress } from './useLongPress';

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('un appui court est un clic ordinaire', () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onClick, onLongPress));
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(LONG_PRESS_MS - 1);
      result.current.press.onPointerUp();
    });
    act(() => {
      result.current.onClick();
    });
    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('un appui long déclenche l’appui long une fois, et ignore le clic suivant', () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(onClick, onLongPress));
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(LONG_PRESS_MS * 3);
      result.current.press.onPointerUp();
    });
    act(() => {
      result.current.onClick();
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    act(() => {
      result.current.onClick();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('quitter le bouton annule l’appui long', () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress(vi.fn(), onLongPress));
    act(() => {
      result.current.press.onPointerDown();
      result.current.press.onPointerLeave();
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    });
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('sans appui long, le bouton reste ordinaire', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useLongPress(onClick));
    act(() => {
      result.current.press.onPointerDown();
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
      result.current.press.onPointerUp();
    });
    act(() => {
      result.current.onClick();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
