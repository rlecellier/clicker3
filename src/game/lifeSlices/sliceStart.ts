import { answerBirthday, birthdayByAge } from '@game/birthday';
import { events, startState } from '@game/data';
import type { SliceStart } from '@game/data';
import { readMail } from '@game/mail';
import { markAllSeen } from '@game/novelty';
import { updatePhase } from '@game/phases';
import { isUnlocked } from '@game/requirements';
import { placementIds } from '@game/state';
import type { GameState, LifeSliceId } from '@game/state';
import { PERIODS_PER_YEAR } from '@game/time';
import { withModifiers } from '@game/upgrades';

// Les événements uniques déjà déclenchés à cet âge sont réputés avoir eu lieu :
// ils ne surviennent pas tous d'un coup au départ, et leurs effets sont déjà
// compris dans les chiffres de l'état de départ.
const alreadyFired = (state: GameState) =>
  events
    .filter(
      (event) =>
        event.unique &&
        event.trigger !== undefined &&
        isUnlocked(state, event.trigger),
    )
    .map(({ id }) => id);

/**
 * Début d'une partie plus loin dans la vie : le jeu complet, à cet âge, avec
 * l'état de départ arbitraire de la tranche. Le temps reste continu (le
 * personnage a eu 18 ans en janvier 1999) : on avance le compteur de périodes
 * plutôt que de changer l'âge de départ, ce qui garde dates et événements du
 * monde cohérents.
 */
export const sliceGame = (start: SliceStart, lifeSlice: LifeSliceId) => {
  const { life } = startState;
  const filled: GameState = withModifiers({
    ...startState,
    lifeSlice,
    period: (start.age - life.startAge) * PERIODS_PER_YEAR,
    jobId: start.jobId,
    money: start.money,
    stock: start.stock,
    reputation: start.reputation,
    reputationEarned: start.reputationEarned,
    stats: start.stats,
    companies: start.companies,
    upgrades: [...start.upgrades],
    districts: [...start.districts],
    warehouses: start.warehouses,
    placements: start.placements,
    openedPlacements: [...placementIds],
    autoWork: start.autoWork,
  });
  const reached = updatePhase(filled);
  const quiet: GameState = markAllSeen({
    ...reached,
    firedEvents: alreadyFired(reached),
  });
  // L'anniversaire du départ : la fenêtre quand il y en a une, sinon il est
  // fêté sans bruit (l'état de départ du bilan suivant en dépend).
  const celebrated = {
    ...quiet,
    pendingBirthday: { age: start.age, recap: null },
  };
  return birthdayByAge(start.age) === undefined
    ? readMail(answerBirthday(celebrated))
    : celebrated;
};
