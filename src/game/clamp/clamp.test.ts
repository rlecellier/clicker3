import { clamp } from './clamp';

describe('clamp', () => {
  it('garde une valeur dans les bornes', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('ramène une valeur trop basse ou trop haute aux bornes', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});
