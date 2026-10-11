import { MAX_READING_MS, readingTime } from './readingTime';

describe('readingTime', () => {
  it('compte 4 s de base, plus 60 ms par caractère', () => {
    expect(readingTime('')).toBe(4000);
    expect(readingTime('a'.repeat(50))).toBe(7000);
  });

  it('plafonne à 15 s', () => {
    expect(readingTime('a'.repeat(183))).toBe(14_980);
    expect(readingTime('a'.repeat(184))).toBe(MAX_READING_MS);
    expect(readingTime('a'.repeat(5000))).toBe(MAX_READING_MS);
  });
});
