import { describe, expect, it } from 'vitest';
import { MAX_FAVORITES, toggleFavorite } from './useFavorites';

describe('favoris', () => {
  it('ajoute puis retire une activité', () => {
    const added = toggleFavorite([], 'a');
    expect(added).toEqual(['a']);
    expect(toggleFavorite(added, 'a')).toEqual([]);
  });

  it('refuse un favori de trop, mais laisse retirer', () => {
    const full = Array.from(
      { length: MAX_FAVORITES },
      (_, index) => `f${index}`,
    );
    expect(toggleFavorite(full, 'de-trop')).toEqual(full);
    expect(toggleFavorite(full, 'f0')).toHaveLength(MAX_FAVORITES - 1);
  });
});
