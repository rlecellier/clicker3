import { districts, startState } from '@game/data';
import { gainReputation } from '@game/reputation';
import { canUnlockDistrict, unlockDistrict } from './districts';

describe('données des quartiers', () => {
  it('liste les quatre quartiers dans l’ordre de la carte', () => {
    expect(districts.map((district) => district.id)).toEqual([
      'tilleuls',
      'hauts-fourneaux',
      'parc-horizon',
      'pole-excellence',
    ]);
  });

  it('ouvre le premier quartier au départ', () => {
    expect(startState.districts).toEqual(['tilleuls']);
  });
});

const cost = (id: string) =>
  districts.find((district) => district.id === id)?.cost ?? 0;

describe('unlockDistrict', () => {
  const ready = gainReputation(startState, 12);

  it('débloque le quartier et dépense sa réputation', () => {
    const next = unlockDistrict(ready, 'hauts-fourneaux');
    expect(next.districts).toEqual(['tilleuls', 'hauts-fourneaux']);
    expect(next.reputation).toBe(12 - cost('hauts-fourneaux'));
    expect(next.reputationEarned).toBe(12);
  });

  it('refuse si la réputation dépensable manque', () => {
    const poor = {
      ...gainReputation(startState, 12),
      reputation: 0,
    };
    expect(canUnlockDistrict(poor, 'hauts-fourneaux')).toBe(false);
    expect(unlockDistrict(poor, 'hauts-fourneaux')).toBe(poor);
  });

  it('refuse si la condition de palier manque, même avec assez de solde', () => {
    const rich = { ...startState, reputation: 1000, reputationEarned: 12 };
    expect(unlockDistrict(rich, 'parc-horizon')).toBe(rich);
  });

  it('refuse quand le personnage est mort', () => {
    const dead = { ...ready, status: 'dead' as const };
    expect(unlockDistrict(dead, 'hauts-fourneaux')).toBe(dead);
  });

  it('refuse un quartier déjà débloqué ou inconnu', () => {
    expect(unlockDistrict(ready, 'tilleuls')).toBe(ready);
    expect(unlockDistrict(ready, 'nulle-part')).toBe(ready);
  });

  it('débloque les quartiers suivants quand les paliers sont atteints', () => {
    let state = gainReputation(startState, 300);
    for (const id of ['hauts-fourneaux', 'parc-horizon', 'pole-excellence']) {
      state = unlockDistrict(state, id);
    }
    expect(state.districts).toHaveLength(4);
    expect(state.reputation).toBe(
      300 -
        cost('hauts-fourneaux') -
        cost('parc-horizon') -
        cost('pole-excellence'),
    );
  });
});
