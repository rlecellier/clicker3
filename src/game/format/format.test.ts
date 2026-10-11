import { startState } from '@game/data';
import {
  checkRequirement,
  describeReputationTier,
  describeRequirement,
  formatDate,
  formatMoney,
  formatPhase,
} from './format';

// Les espaces de Intl sont insécables : `\s` les couvre, on les ramène à une espace simple.
const plain = (text: string) => text.replaceAll(/\s/g, ' ');

describe('formatMoney', () => {
  it('met des séparateurs de milliers et le symbole euro', () => {
    expect(plain(formatMoney(1250))).toBe('1 250 €');
    expect(plain(formatMoney(0))).toBe('0 €');
    expect(plain(formatMoney(2_500_000))).toBe('2 500 000 €');
  });

  it('arrondit aux euros entiers', () => {
    expect(plain(formatMoney(12.6))).toBe('13 €');
  });
});

describe('formatDate', () => {
  it('écrit le mois en toutes lettres', () => {
    expect(formatDate({ year: 1999, month: 1 })).toBe('janvier 1999');
    expect(formatDate({ year: 2005, month: 12 })).toBe('décembre 2005');
  });
});

describe('formatPhase', () => {
  it('donne la phase satirique, et ajoute la vieillesse', () => {
    expect(formatPhase(startState)).toBe('Jeune actif en devenir');
    const old = { ...startState, period: 12 * 45 };
    expect(formatPhase(old)).toContain('senior');
  });
});

describe('describeRequirement', () => {
  it('nomme le palier manquant', () => {
    expect(
      describeRequirement({ type: 'stat', stat: 'gestion', tier: 2 }),
    ).toBe('Palier Gestion 2 requis');
  });

  it('assemble les conditions multiples', () => {
    expect(
      describeRequirement({
        type: 'all',
        of: [
          { type: 'stat', stat: 'metier', tier: 2 },
          { type: 'reputationTier', tier: 1 },
        ],
      }),
    ).toBe('Palier Métier 2 requis · Palier de réputation 1 requis');
  });
});

describe('checkRequirement', () => {
  it('liste chaque condition avec son état et la progression', () => {
    const state = { ...startState, reputationEarned: 10 };
    const checks = checkRequirement(state, {
      type: 'all',
      of: [
        { type: 'reputationTier', tier: 1 },
        { type: 'reputationTier', tier: 2 },
      ],
    });
    expect(checks.map((check) => check.isMet)).toEqual([true, false]);
    expect(plain(checks[1]?.label ?? '')).toBe(
      'Palier de réputation 2 « Acteur majeur » : 10 / 100 de réputation gagnée',
    );
  });
});

describe('describeReputationTier', () => {
  it('donne le palier et le seuil suivant', () => {
    expect(describeReputationTier(startState)).toBe(
      'Palier 0 · Inconnu · prochain à 6 gagnés (0)',
    );
  });
});
