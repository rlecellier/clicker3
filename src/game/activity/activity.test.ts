import { startState } from '@game/data';
import type { GaugeSegment, GameState } from '@game/state';
import { currentActivity } from './activity';

const withSegments = (segments: GaugeSegment[]): GameState => ({
  ...startState,
  gauge: segments.reduce((sum, { amount }) => sum + amount, 0),
  gaugeSegments: segments,
});

describe('currentActivity', () => {
  it('ne fait rien de particulier en début de période', () => {
    expect(currentActivity(startState)).toBe('idle');
  });

  it('suit la dernière action de la période', () => {
    const state = withSegments([
      { kind: 'study', amount: 10 },
      { kind: 'work', amount: 10 },
    ]);
    expect(currentActivity(state)).toBe('work');
    expect(currentActivity(withSegments([{ kind: 'study', amount: 5 }]))).toBe(
      'study',
    );
  });

  it('ne fait rien de particulier sans action dans la période', () => {
    expect(currentActivity(withSegments([]))).toBe('idle');
  });

  it('est terminé à la mort', () => {
    expect(currentActivity({ ...startState, status: 'dead' })).toBe('over');
  });
});
