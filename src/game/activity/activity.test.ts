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

  it('dort tant que le cerveau se vide, quoi qu’il ait fait avant', () => {
    const state = {
      ...withSegments([{ kind: 'work', amount: 10 }]),
      isSleeping: true,
    };
    expect(currentActivity(state)).toBe('sleep');
  });

  it('ne travaille plus une fois réveillé après un sommeil seul', () => {
    expect(currentActivity(withSegments([{ kind: 'sleep', amount: 5 }]))).toBe(
      'idle',
    );
  });

  it('est terminé à la mort', () => {
    expect(currentActivity({ ...startState, status: 'dead' })).toBe('over');
  });
});
