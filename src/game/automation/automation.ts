import { afterAction } from '@game/afterAction';
import { automationRules } from '@game/data';
import { eventById, fireEvent } from '@game/events';
import { isBirthdayPending } from '@game/birthday';
import { isPromotionPending, offerPromotion } from '@game/promotion';
import { sleepStep, sleepStepMs } from '@game/sleep';
import { isPlaying } from '@game/state';
import type { GameState, JournalEntry } from '@game/state';
import { ageOf } from '@game/time';
import { hasAutomation } from '@game/upgrades';
import { JOB_TARGET, canWork, work } from '@game/work';

export type AutoAction = 'work';

// Délai entre deux actions automatiques : rythme de référence ÷ coefficient
// de l'auto (¼, ADR 0005).
export const autoIntervalMs =
  automationRules.referenceIntervalMs / automationRules.speedFactor;

// Délai avant le prochain pas : plus court pendant le sommeil.
const stepIntervalMs = (state: GameState) =>
  state.isSleeping ? sleepStepMs(state) : autoIntervalMs;

// Un interrupteur n'agit que si l'amélioration correspondante est achetée.
export const isAutoActive = (state: GameState, action: AutoAction) =>
  state.autoWork && hasAutomation(state, action);

// Le temps réel fait avancer la partie : travail automatique actif, ou
// sommeil en cours. Sinon, le temps écoulé n'a aucun effet.
// Une promotion ou un anniversaire qui attend une réponse arrête le temps.
export const isTimeRunning = (state: GameState) =>
  !isPromotionPending(state) &&
  !isBirthdayPending(state) &&
  (isAutoActive(state, 'work') || state.isSleeping);

export const canEnableAuto = (state: GameState, action: AutoAction) =>
  isPlaying(state) && hasAutomation(state, action);

// Active ou coupe un interrupteur. Couper est toujours possible ; activer
// demande l'amélioration.
export const setAuto = (
  state: GameState,
  action: AutoAction,
  isEnabled: boolean,
): GameState => {
  if (isEnabled && !canEnableAuto(state, action)) {
    return state;
  }
  return state.autoWork === isEnabled
    ? state
    : { ...state, autoWork: isEnabled };
};

// Un pas du temps qui passe : un marqueur se vide pendant le sommeil, sinon
// le travail automatique travaille à son emploi. Rend l'état inchangé s'il n'y
// a rien à faire.
const autoStep = (state: GameState): GameState => {
  if (state.isSleeping) {
    return sleepStep(state);
  }
  return isAutoActive(state, 'work') && canWork(state, JOB_TARGET)
    ? work(state, JOB_TARGET, true)
    : state;
};

// Joue les pas dus (travail automatique, sommeil). Sans interrupteur actif ni
// sommeil, ou sans rien à faire, le temps n'avance pas et le temps écoulé est perdu. `onAction` voit
// chaque action jouée (avant, après). `isAway` : le joueur n'est pas là pour
// répondre, aucune promotion n'interrompt le rattrapage (le compteur d'heures
// sup. continue, l'offre attend le retour).
const runAuto = (
  state: GameState,
  elapsedMs: number,
  onAction?: (before: GameState, after: GameState) => void,
  isAway = false,
): GameState => {
  if (elapsedMs <= 0 || !isPlaying(state) || !isTimeRunning(state)) {
    return state;
  }
  let current: GameState = {
    ...state,
    autoElapsed: state.autoElapsed + elapsedMs,
  };
  while (
    isPlaying(current) &&
    isTimeRunning(current) &&
    current.autoElapsed >= stepIntervalMs(current)
  ) {
    const acted = autoStep(current);
    if (acted === current) {
      return { ...current, autoElapsed: 0 };
    }
    const afterwards = afterAction(acted);
    // Le joueur absent ne répond pas : l'offre de promotion et l'anniversaire
    // sont reproposés à son retour (sauf au décès, où rien ne rejoue).
    const settled = isAway
      ? {
          ...afterwards,
          pendingPromotion: null,
          pendingBirthday: isPlaying(afterwards)
            ? null
            : afterwards.pendingBirthday,
        }
      : afterwards;
    onAction?.(current, settled);
    current = {
      ...settled,
      autoElapsed: current.autoElapsed - stepIntervalMs(current),
    };
  }
  // Le temps accumulé n'attend pas la réponse : il serait rejoué d'un coup.
  return isPromotionPending(current) || isBirthdayPending(current)
    ? { ...current, autoElapsed: 0 }
    : current;
};

// Fait avancer les actions automatiques de `elapsedMs` (temps réel écoulé).
export const autoTick = (state: GameState, elapsedMs: number): GameState =>
  runAuto(state, elapsedMs);

// « Pendant votre absence » : ce qui s'est passé.
export type AbsenceSummary = {
  elapsedMs: number;
  // Actions automatiques jouées.
  actions: number;
  periods: number;
  // Variations nettes entre le départ et le retour.
  money: number;
  stock: number;
  reputation: number;
  ageBefore: number;
  ageAfter: number;
  died: boolean;
  // Événements survenus, dans l'ordre.
  events: JournalEntry[];
};

export type CatchUpResult = { state: GameState; summary: AbsenceSummary };

// Rejoue l'absence : mêmes règles que `autoTick`, sans plafond, jusqu'à la
// mort. La boucle compte les actions dues (jamais les millisecondes). Au
// retour, si le personnage a vécu, l'événement « retour après absence » survient.
export const catchUp = (state: GameState, elapsedMs: number): CatchUpResult => {
  let actions = 0;
  const events: JournalEntry[] = [];
  const away = runAuto(
    state,
    elapsedMs,
    (before, after) => {
      actions += 1;
      const known = new Set(before.events);
      events.push(...after.events.filter((entry) => !known.has(entry)));
    },
    true,
  );
  // L'offre qui a attendu le retour s'affiche à l'arrivée.
  const replayed = isPlaying(away) ? offerPromotion(away) : away;
  const comeback = eventById('retour-absence');
  const next =
    comeback !== undefined && actions > 0 && isPlaying(replayed)
      ? fireEvent(replayed, comeback)
      : replayed;
  const comebackEntry = next === replayed ? undefined : next.events.at(-1);
  if (comebackEntry !== undefined) {
    events.push(comebackEntry);
  }
  return {
    state: next,
    summary: {
      elapsedMs: Math.max(0, elapsedMs),
      actions,
      periods: next.period - state.period,
      money: next.money - state.money,
      stock: next.stock - state.stock,
      reputation: next.reputation - state.reputation,
      ageBefore: ageOf(state),
      ageAfter: ageOf(next),
      died: next.status === 'dead',
      events,
    },
  };
};

// En deçà de ce délai, une ouverture est un rechargement de page, pas une
// absence : le temps écoulé se joue comme au fil de l'eau, sans écran « pendant
// votre absence » (le sommeil et le travail auto avancent en temps réel).
export const reloadGraceMs = 3000;

/**
 * Point d'entrée unique du retour dans le jeu : rattrape l'absence depuis
 * `lastSeenAt` (écrit par `serialize` à la sauvegarde), puis note `now`, fourni
 * par l'appelant (les règles ne lisent jamais l'horloge). Sans `lastSeenAt`
 * (première partie) ou si `now` le précède, rien n'est rattrapé. Sous
 * `graceMs`, le temps écoulé se joue sans résumé ni événement de retour.
 */
export const resume = (
  state: GameState,
  now: number,
  graceMs = 0,
): CatchUpResult => {
  const elapsedMs =
    state.lastSeenAt === null ? 0 : Math.max(0, now - state.lastSeenAt);
  if (elapsedMs < graceMs) {
    return {
      state: { ...autoTick(state, elapsedMs), lastSeenAt: now },
      summary: catchUp(state, 0).summary,
    };
  }
  const { state: caughtUp, summary } = catchUp(state, elapsedMs);
  return { state: { ...caughtUp, lastSeenAt: now }, summary };
};
