import { renderHook } from '@testing-library/react';
import { EARLY_TAP_MS, useIgnoreEarlyTaps } from './useIgnoreEarlyTaps';

describe('useIgnoreEarlyTaps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ignore le click qui suit l’appui ayant ouvert la fenêtre', () => {
    const action = vi.fn();
    const { result } = renderHook(() => useIgnoreEarlyTaps('premier-mot'));
    // L’appui sur « Gazouiller » ouvre la fenêtre, puis son click arrive.
    vi.advanceTimersByTime(80);
    result.current(action)();
    expect(action).not.toHaveBeenCalled();
  });

  it('laisse passer un appui franc une fois le délai écoulé', () => {
    const action = vi.fn();
    const { result } = renderHook(() => useIgnoreEarlyTaps('premier-mot'));
    vi.advanceTimersByTime(EARLY_TAP_MS);
    result.current(action)();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('repart de zéro quand une autre fenêtre s’ouvre', () => {
    const action = vi.fn();
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useIgnoreEarlyTaps(key),
      { initialProps: { key: 'premier-mot' } },
    );
    vi.advanceTimersByTime(EARLY_TAP_MS * 2);
    rerender({ key: 'un-chat' });
    result.current(action)();
    expect(action).not.toHaveBeenCalled();
  });
});
