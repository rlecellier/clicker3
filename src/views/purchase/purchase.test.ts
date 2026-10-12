import { startState } from '@game/data';
import type { Requirement } from '@game/requirements';
import {
  ENDED,
  NO_MONEY,
  missingConditions,
  ownedBadge,
  unavailableReason,
} from './purchase';

const requirement: Requirement = { type: 'reputation', min: 5 };

describe('missingConditions', () => {
  it('ne liste rien sans condition ou quand elle est remplie', () => {
    expect(missingConditions(startState, undefined)).toBeUndefined();
    expect(
      missingConditions({ ...startState, reputation: 5 }, requirement),
    ).toBeUndefined();
  });

  it('liste les conditions quand il en manque', () => {
    expect(missingConditions(startState, requirement)).toEqual([
      { label: expect.any(String), isMet: false },
    ]);
  });
});

describe('unavailableReason', () => {
  it('ne donne aucune raison à un achat déjà fait', () => {
    expect(
      unavailableReason(startState, { isDone: true, shortage: NO_MONEY }),
    ).toBeUndefined();
  });

  it('annonce la fin de partie avant tout le reste', () => {
    expect(
      unavailableReason(
        { ...startState, status: 'dead' },
        { requirement, shortage: NO_MONEY },
      ),
    ).toBe(ENDED);
  });

  it('laisse les conditions parler quand un prérequis manque', () => {
    expect(
      unavailableReason(startState, { requirement, shortage: NO_MONEY }),
    ).toBeUndefined();
  });

  it('donne la ressource qui manque quand tout est débloqué', () => {
    expect(unavailableReason(startState, { shortage: NO_MONEY })).toBe(
      NO_MONEY,
    );
  });
});

describe('ownedBadge', () => {
  it('compte les exemplaires possédés, rien à zéro', () => {
    expect(ownedBadge(0)).toBeUndefined();
    expect(ownedBadge(3)).toBe('3 possédé(s)');
  });
});
