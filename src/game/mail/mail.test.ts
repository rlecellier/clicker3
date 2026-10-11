import { events, journalLimit, startState } from '@game/data';
import { fireEvent } from '@game/events';
import type { GameState } from '@game/state';
import { readMail, unreadMail } from './mail';

const [event] = events;
if (event === undefined) {
  throw new Error('Aucun événement dans les données');
}

const receive = (state: GameState, count: number) => {
  let result = state;
  for (let index = 0; index < count; index++) {
    result = fireEvent(result, event);
  }
  return result;
};

describe('courrier non lu', () => {
  it('démarre sans message non lu', () => {
    expect(unreadMail(startState)).toBe(0);
  });

  it('compte chaque message reçu', () => {
    expect(unreadMail(receive(startState, 3))).toBe(3);
  });

  it('se vide à la lecture, puis recompte les nouveaux messages', () => {
    const read = readMail(receive(startState, 3));
    expect(unreadMail(read)).toBe(0);
    expect(unreadMail(receive(read, 2))).toBe(2);
  });

  it('ne change pas l’état quand tout est lu', () => {
    expect(readMail(startState)).toBe(startState);
  });

  it('reste borné par le journal tronqué', () => {
    const flooded = receive(startState, journalLimit + 50);
    expect(flooded.events).toHaveLength(journalLimit);
    expect(flooded.mailReceived).toBe(journalLimit + 50);
    expect(unreadMail(flooded)).toBe(journalLimit);
  });

  it('garde les non-lus après une lecture suivie d’une troncature', () => {
    const state = receive(readMail(receive(startState, 10)), journalLimit + 5);
    expect(unreadMail(state)).toBe(journalLimit);
  });
});
