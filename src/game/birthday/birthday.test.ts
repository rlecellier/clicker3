import { birthdays, startState } from '@game/data';
import { autoTick } from '@game/automation';
import { newGame, reduce } from '@game/reducer';
import type { GameState } from '@game/state';
import { answerBirthday, offerBirthday } from './birthday';

// Un état déjà passé par le 18e anniversaire.
const started = newGame();
const celebrated: GameState = answerBirthday(started);

const atAge = (age: number, changes: Partial<GameState> = {}): GameState => ({
  ...celebrated,
  period: (age - startState.life.startAge) * 12,
  ...changes,
});

describe('données', () => {
  it('listent les âges dans l’ordre, du départ à la mort', () => {
    const ages = birthdays.map((birthday) => birthday.age);
    expect(ages).toEqual(ages.toSorted((a, b) => a - b));
    expect(ages[0]).toBe(startState.life.startAge);
    expect(ages.at(-1)).toBe(startState.life.deathAge);
  });
});

describe('départ', () => {
  it('fête les 18 ans, sans bilan, et arrête le jeu', () => {
    expect(started.pendingBirthday).toEqual({ age: 18, recap: null });
    expect(reduce(started, { type: 'work', target: 'job' })).toBe(started);
    const automated = {
      ...started,
      upgrades: ['procedure-travail'],
      autoWork: true,
    };
    expect(autoTick(automated, 10_000)).toEqual(automated);
  });

  it('reprend après la fermeture de la fenêtre', () => {
    const next = reduce(started, { type: 'answerBirthday' });
    expect(next.pendingBirthday).toBeNull();
    expect(next.mailReceived).toBe(started.mailReceived + 1);
    expect(next.events.at(-1)?.id).toBe('birthday-18');
  });
});

describe('offre', () => {
  it('ne propose rien avant le prochain âge', () => {
    expect(offerBirthday(atAge(19))).toEqual(atAge(19));
  });

  it('propose les 20 ans avec le bilan depuis les 18 ans', () => {
    const state = atAge(20, {
      money: 500,
      upgrades: ['a'],
      reputationEarned: 3,
    });
    expect(offerBirthday(state).pendingBirthday).toEqual({
      age: 20,
      recap: {
        months: 24,
        money: 500,
        companies: 0,
        upgrades: 1,
        reputation: 3,
      },
    });
  });

  it('ne fête que le dernier âge quand plusieurs sont passés d’un coup', () => {
    expect(offerBirthday(atAge(31)).pendingBirthday?.age).toBe(30);
  });

  it('ne remplace pas un anniversaire qui attend', () => {
    const waiting = { ...atAge(26), pendingBirthday: { age: 25, recap: null } };
    expect(offerBirthday(waiting)).toBe(waiting);
  });

  it('repart de l’anniversaire précédent après la réponse', () => {
    const fêté = answerBirthday(offerBirthday(atAge(20, { money: 500 })));
    expect(fêté.birthdayBase.age).toBe(20);
    expect(fêté.birthdayBase.money).toBe(500);
    const later = offerBirthday({ ...fêté, period: 12 * 7 + 1, money: 800 });
    expect(later.pendingBirthday?.recap?.money).toBe(300);
  });
});

describe('réponse', () => {
  it('ne change rien sans anniversaire en attente', () => {
    expect(answerBirthday(celebrated)).toBe(celebrated);
  });
});

describe('mort', () => {
  it('fête les 75 ans, même mort, avec le bilan', () => {
    const dead = atAge(75, { status: 'dead' });
    expect(offerBirthday(dead).pendingBirthday?.age).toBe(75);
  });
});
