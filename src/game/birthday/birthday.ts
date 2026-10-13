import { birthdays, journalLimit } from '@game/data';
import type { Birthday } from '@game/data';
import type { BirthdayBase, BirthdayRecap, GameState } from '@game/state';
import { lifeFigures } from '@game/summary';
import { PERIODS_PER_YEAR } from '@game/time';

export const birthdayByAge = (age: number): Birthday | undefined =>
  birthdays.find((birthday) => birthday.age === age);

const baseOf = (state: GameState): BirthdayBase => {
  const figures = lifeFigures(state);
  return {
    age: figures.age,
    period: state.period,
    money: figures.money,
    companies: figures.companies,
    upgrades: state.upgrades.length,
    reputationEarned: state.reputationEarned,
  };
};

const recapOf = (base: BirthdayBase, state: GameState): BirthdayRecap => {
  const now = baseOf(state);
  return {
    months: now.period - base.period,
    money: now.money - base.money,
    companies: now.companies - base.companies,
    upgrades: now.upgrades - base.upgrades,
    reputation: now.reputationEarned - base.reputationEarned,
  };
};

// Le jeu attend que le joueur ferme la fenêtre d'anniversaire.
export const isBirthdayPending = (state: GameState) =>
  state.pendingBirthday !== null;

// Propose le plus haut anniversaire atteint et pas encore fêté (si plusieurs
// âges sont passés d'un coup, on ne fête que le dernier). Sans effet tant
// qu'un anniversaire attend. À appeler après chaque action (`afterAction`).
export const offerBirthday = (state: GameState): GameState => {
  if (isBirthdayPending(state)) {
    return state;
  }
  const age = lifeFigures(state).age;
  const reached = birthdays.findLast(
    (birthday) => birthday.age <= age && birthday.age > state.birthdayBase.age,
  );
  return reached === undefined
    ? state
    : {
        ...state,
        pendingBirthday: {
          age: reached.age,
          recap: recapOf(state.birthdayBase, state),
        },
      };
};

// Le joueur ferme la fenêtre : l'anniversaire est fêté, le prochain bilan
// partira d'ici. Une ligne est écrite au courrier. Sans anniversaire en
// attente, l'état est rendu inchangé.
export const answerBirthday = (state: GameState): GameState => {
  const { pendingBirthday } = state;
  if (pendingBirthday === null) {
    return state;
  }
  const birthday = birthdayByAge(pendingBirthday.age);
  return {
    ...state,
    pendingBirthday: null,
    birthdayBase: { ...baseOf(state), age: pendingBirthday.age },
    mailReceived: state.mailReceived + 1,
    events: [
      ...state.events,
      {
        period: state.period,
        id: `birthday-${pendingBirthday.age}`,
        text: birthday?.title ?? `${pendingBirthday.age} ans`,
      },
    ].slice(-journalLimit),
  };
};

// Années écoulées, pour afficher le bilan.
export const recapYears = (recap: BirthdayRecap) =>
  Math.round(recap.months / PERIODS_PER_YEAR);
