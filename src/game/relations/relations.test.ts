import { describe, expect, it } from 'vitest';
import { childEvents, childRules } from '@game/data';
import { chooseEvent, doActivity, eligibleEvents } from '@game/earlyChildhood';
import { newGame } from '@game/reducer';
import type { GameState } from '@game/state';
import {
  applyBondBonuses,
  bondTier,
  changeBond,
  hasFriend,
  initialRelations,
  meetFriend,
  passionOf,
  relationActivities,
  relationById,
} from '.';

const baby = () => newGame(undefined, 'earlyChildhood');

const withBond = (state: GameState, id: string, bond: number): GameState => ({
  ...state,
  relations: state.relations.map((relation) =>
    relation.id === id ? { ...relation, bond } : relation,
  ),
});

const person = (state: GameState, id: string) => {
  const found = relationById(state, id);
  if (found === undefined) {
    throw new Error(`Personne absente : ${id}`);
  }
  return found;
};

const bondOf = (state: GameState, id: string) =>
  relationById(state, id)?.bond ?? NaN;

describe('relations : le départ', () => {
  it('viennent des parents de la situation, avec un lien timide', () => {
    const relations = initialRelations('standard');
    expect(relations.map(({ id, kind }) => [id, kind])).toEqual([
      ['mother', 'family'],
      ['father', 'family'],
    ]);
    // 30 % de l'affection (60) : un bébé ne joue pas encore avec ses parents.
    expect(relations.every(({ bond }) => bond === 18)).toBe(true);
    expect(baby().relations).toEqual(relations);
    expect(initialRelations('inconnue')).toEqual([]);
  });

  it('existent dans toute tranche, pas seulement la petite enfance', () => {
    expect(newGame().relations).toHaveLength(2);
    expect(newGame(undefined, 'adulthood').relations).toHaveLength(2);
  });
});

describe('relations : le lien', () => {
  it('monte et descend entre 0 et 100', () => {
    const state = baby();
    expect(bondOf(changeBond(state, 'mother', 10), 'mother')).toBe(28);
    expect(bondOf(changeBond(state, 'mother', 500), 'mother')).toBe(100);
    expect(bondOf(changeBond(state, 'mother', -500), 'mother')).toBe(0);
  });

  it('ignore une personne inconnue', () => {
    const state = baby();
    expect(changeBond(state, 'fantome', 5)).toBe(state);
  });

  it('est amorti par un proche au lien très fort : les pertes divisées par deux', () => {
    const state = withBond(baby(), 'father', 40);
    expect(bondOf(changeBond(state, 'father', -6), 'father')).toBe(34);
    const supported = withBond(
      state,
      'mother',
      childRules.relations.tiers.support,
    );
    expect(bondOf(changeBond(supported, 'father', -6), 'father')).toBe(37);
    // Un gain n'est pas modifié.
    expect(bondOf(changeBond(supported, 'father', 6), 'father')).toBe(46);
  });

  it('range un lien dans quatre paliers', () => {
    expect(
      [0, 24, 25, 49, 50, 74, 75, 100].map((bond) => bondTier(bond)),
    ).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });
});

describe('relations : le premier ami', () => {
  it('arrive une seule fois, avec le lien de la rencontre', () => {
    const state = meetFriend(baby(), 'Noa', 40);
    expect(hasFriend(baby())).toBe(false);
    expect(hasFriend(state)).toBe(true);
    expect(relationById(state, 'friend')).toEqual({
      id: 'friend',
      name: 'Noa',
      role: 'ami',
      kind: 'friend',
      bond: 40,
    });
    expect(meetFriend(state, 'Léa', 90)).toBe(state);
  });

  it('naît d’un événement obligatoire à 3 ans, quel que soit le choix', () => {
    const opened = {
      ...baby(),
      child: { ...baby().child, quarter: 12, pendingEvent: 'firstFriend' },
    };
    const shared = chooseEvent(opened, 0);
    expect(bondOf(shared, 'friend')).toBe(40);
    expect(bondOf(chooseEvent(opened, 2), 'friend')).toBe(5);
  });
});

describe('relations : ce que la personne aime partager', () => {
  it('vient de la situation pour un parent, et de l’ami pour un ami', () => {
    const state = meetFriend(baby(), 'Noa', 10);
    expect(passionOf(state, person(state, 'mother'))).toMatchObject({
      axis: 'sociability',
    });
    expect(passionOf(state, person(state, 'friend'))).toMatchObject({
      axis: 'sociability',
    });
    expect(passionOf(state, person(state, 'father'))).toMatchObject({
      axis: 'energy',
    });
  });
});

describe('relations : les activités', () => {
  it('s’ouvrent au premier palier de lien', () => {
    expect(relationActivities(baby())).toEqual([]);
    const close = withBond(baby(), 'mother', 25);
    expect(relationActivities(close).map(({ id, name }) => [id, name])).toEqual(
      [['with:mother', 'Jouer avec Maman']],
    );
  });

  it('poussent l’axe de la personne et renforcent le lien', () => {
    const state = doActivity(withBond(baby(), 'father', 30), 'with:father');
    expect(state.child.axes.energy).toBe(3);
    expect(bondOf(state, 'father')).toBe(32);
    expect(state.child.fill).toBe(1);
  });

  it('se ferment quand le lien retombe', () => {
    const state = withBond(baby(), 'father', 10);
    expect(doActivity(state, 'with:father')).toBe(state);
  });
});

describe('relations : le bonus passif', () => {
  it('pousse en douce l’axe de la personne dès le deuxième palier', () => {
    const close = withBond(baby(), 'father', 50);
    expect(applyBondBonuses(close).child.axes.energy).toBe(
      childRules.relations.bonusAmount,
    );
    expect(applyBondBonuses(baby())).toEqual(baby());
  });

  it('cumule les personnes proches', () => {
    const both = withBond(withBond(baby(), 'father', 60), 'mother', 60);
    const next = applyBondBonuses(both);
    expect(next.child.axes.energy).toBe(2);
    expect(next.child.axes.sociability).toBe(2);
  });
});

describe('relations : les événements', () => {
  it('« Maman » rapproche de la mère, « Papa » du père', () => {
    const opened = {
      ...baby(),
      child: { ...baby().child, pendingEvent: 'firstWord' },
    };
    expect(bondOf(chooseEvent(opened, 0), 'mother')).toBe(26);
    expect(bondOf(chooseEvent(opened, 1), 'father')).toBe(26);
  });

  it('s’ouvrent selon le lien : l’histoire du soir demande une mère proche', () => {
    const young = { ...baby(), child: { ...baby().child, quarter: 8 } };
    expect(eligibleEvents(young).map(({ id }) => id)).not.toContain(
      'bedtimeStory',
    );
    expect(
      eligibleEvents(withBond(young, 'mother', 50)).map(({ id }) => id),
    ).toContain('bedtimeStory');
  });

  it('ne citent que des personnes qui existent dans la situation', () => {
    const people = new Set([
      ...initialRelations('standard').map(({ id }) => id),
      'friend',
    ]);
    for (const event of childEvents) {
      const mentioned = [
        ...event.conditions.flatMap((condition) =>
          condition.type === 'bond' ? [condition.person] : [],
        ),
        ...event.choices.flatMap(({ effects }) =>
          effects.flatMap((effect) =>
            effect.type === 'bond' ? [effect.person] : [],
          ),
        ),
      ];
      expect(
        mentioned.every((id) => people.has(id)),
        event.id,
      ).toBe(true);
    }
  });
});
