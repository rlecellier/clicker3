import { boostById, canBuyBoost } from '@game/boosts';
import { canEnableAuto, isAutoActive } from '@game/automation';
import {
  canBuyCompany,
  canBuyWarehouse,
  companyCost,
  fitsWarehouse,
  isCompanyMaxed,
  ownedCount,
  warehouseCost,
} from '@game/companies';
import {
  boosts,
  companies,
  courses,
  districts,
  economyRules,
  jobs,
  statTierThresholds,
  upgrades,
} from '@game/data';
import type { Company } from '@game/data';
import { fixedExpensesOf } from '@game/economy';
import { canUnlockDistrict } from '@game/districts';
import { canChangeJob, jobById } from '@game/jobs';
import { lastPeriodReport } from '@game/ledger';
import type { GameAction } from '@game/reducer';
import { isRequirementMet } from '@game/requirements';
import type { Requirement } from '@game/requirements';
import { statIds } from '@game/state';
import type { GameState, StatId } from '@game/state';
import { tierOf } from '@game/stats';
import { canStudy } from '@game/study';
import { canSellSurplus } from '@game/surplus';
import { canBuyUpgrade, hasCourse, isOwned } from '@game/upgrades';
import { JOB_TARGET, canWork } from '@game/work';
import { simulatorConfig } from './config';

// Les paliers de stat exigés par une condition (branches « tous » seulement).
const statNeeds = (
  requirement: Requirement | undefined,
): { stat: StatId; tier: number }[] => {
  if (requirement === undefined) {
    return [];
  }
  if (requirement.type === 'stat') {
    return [{ stat: requirement.stat, tier: requirement.tier }];
  }
  return requirement.type === 'all'
    ? requirement.of.flatMap((part) => statNeeds(part))
    : [];
};

// Stat à travailler : le premier niveau qui manque pour l'achat le moins cher
// dont on peut étudier la stat (une formation achetée). Dès qu'un achat moins
// cher est débloqué et n'attend que l'argent, on n'étudie plus : on économise
// (une étude coûte de l'argent, et les 8 niveaux laissent des stats à gagner
// bien après les achats à portée).
const neededStat = (
  state: GameState,
  excluded: ReadonlySet<string>,
): StatId | undefined => {
  const goals = [
    ...upgrades
      .filter(
        (upgrade) => !isOwned(state, upgrade.id) && !excluded.has(upgrade.id),
      )
      .map((upgrade) => ({
        cost: upgrade.price,
        requirement: upgrade.requirement,
        isSaving: true,
      })),
    ...companies
      .filter((company) => !isCompanyMaxed(state, company.id))
      .map((company) => ({
        cost: companyCost(company.id, ownedCount(state, company.id)),
        requirement: company.requirement,
        // Une entreprise ouverte s'achète par `wantedCompany`, pas en économisant.
        isSaving: false,
      })),
  ].toSorted((first, second) => first.cost - second.cost);
  for (const goal of goals) {
    const missing = statNeeds(goal.requirement).find(
      (need) =>
        tierOf(state, need.stat) < need.tier && hasCourse(state, need.stat),
    );
    if (missing !== undefined) {
      return missing.stat;
    }
    if (goal.isSaving && isRequirementMet(state, goal.requirement)) {
      return undefined;
    }
  }
  return undefined;
};

const capacities = (state: GameState) => {
  let production = 0;
  let commerce = 0;
  for (const company of companies) {
    const copies = ownedCount(state, company.id);
    const multiplier = state.companyMultipliers[company.id] ?? 1;
    if (company.kind === 'production') {
      production += copies * company.output * multiplier;
    } else {
      commerce += copies * company.capacity * multiplier;
    }
  }
  return { production, commerce };
};

const throughputPerEuro = (state: GameState, company: Company) =>
  (company.kind === 'production' ? company.output : company.capacity) /
  companyCost(company.id, ownedCount(state, company.id));

// Entreprise à acheter : on équilibre la production et la vente.
const wantedCompany = (state: GameState): Company | undefined => {
  const { production, commerce } = capacities(state);
  const wantedKind = production <= commerce ? 'production' : 'commerce';
  // Produire au-delà de l'entrepôt ne sert à rien : on économise pour l'agrandir.
  return wantedKind === 'production' && production >= state.stockCapacity
    ? undefined
    : companies
        .filter(
          (company) =>
            company.kind === wantedKind && canBuyCompany(state, company.id),
        )
        .toSorted(
          (first, second) =>
            throughputPerEuro(state, second) - throughputPerEuro(state, first),
        )[0];
};

// Il manque de la place : de la production a été perdue à la dernière période,
// ou une production ouverte et payable est refusée faute d'entrepôt. Un joueur
// range alors son stock avec un petit entrepôt, l'issue de secours.
const needsRoom = (state: GameState) =>
  state.lastStatement?.stockFull === true ||
  companies.some(
    (company) =>
      company.kind === 'production' &&
      !isCompanyMaxed(state, company.id) &&
      isRequirementMet(state, company.requirement) &&
      state.money >= companyCost(company.id, ownedCount(state, company.id)) &&
      !fitsWarehouse(state, company.id),
  );

// Un achat qui alourdit loyer ou salaires doit rester couvert par les recettes.
const isCovered = (state: GameState, extra: number) =>
  extra === 0 ||
  lastPeriodReport(state).revenue >=
    simulatorConfig.expenseCover * (fixedExpensesOf(state) + extra);

type Purchase = { cost: number; action: GameAction };

// Argent à garder en caisse pour payer les dépenses fixes de la période suivante.
const reserveOf = (state: GameState) =>
  simulatorConfig.cashReserveMonths * fixedExpensesOf(state);

const nextPurchase = (
  state: GameState,
  excluded: ReadonlySet<string>,
): GameAction | undefined => {
  const salary = jobById(state.jobId)?.salary ?? 0;
  const betterJob = jobs
    .filter((job) => job.salary > salary && canChangeJob(state, job.id))
    .toSorted((first, second) => second.salary - first.salary)[0];
  if (betterJob !== undefined) {
    return { type: 'changeJob', id: betterJob.id };
  }
  const district = districts.find((candidate) =>
    canUnlockDistrict(state, candidate.id),
  );
  if (district !== undefined) {
    return { type: 'unlockDistrict', id: district.id };
  }
  const purchases: Purchase[] = upgrades
    .filter(
      (upgrade) =>
        !excluded.has(upgrade.id) &&
        canBuyUpgrade(state, upgrade.id) &&
        isCovered(state, (upgrade.rent ?? 0) + (upgrade.payroll ?? 0)),
    )
    .map((upgrade) => ({
      cost: upgrade.price,
      action: { type: 'buyUpgrade', id: upgrade.id },
    }));
  // Un coup de pouce n'est acheté que s'il sert : on étudie encore, ou une
  // stat n'est pas finie (le sommeil de l'automatisme compte aussi).
  for (const boost of boosts) {
    const isUseful =
      boost.kind === 'sleepBoost'
        ? statIds.some(
            (stat) => tierOf(state, stat) < statTierThresholds[stat].length,
          )
        : !isAutoActive(state, 'work') &&
          neededStat(state, excluded) !== undefined;
    if (isUseful && canBuyBoost(state, boost.id)) {
      purchases.push({
        cost: boostById(boost.id)?.price ?? Infinity,
        action: { type: 'buyBoost', id: boost.id },
      });
    }
  }
  // L'issue de secours : un petit entrepôt, tant que la place manque.
  const warehousePrice = warehouseCost(state.warehouses);
  if (canBuyWarehouse(state) && needsRoom(state)) {
    purchases.push({
      cost: warehousePrice,
      action: { type: 'buyWarehouse' },
    });
  }
  const company = wantedCompany(state);
  if (company !== undefined) {
    purchases.push({
      cost: companyCost(company.id, ownedCount(state, company.id)),
      action: { type: 'buyCompany', id: company.id },
    });
  }
  // Le moins cher d'abord.
  return purchases
    .filter((purchase) => state.money - purchase.cost >= reserveOf(state))
    .toSorted((first, second) => first.cost - second.cost)[0]?.action;
};

// Où travailler : l'emploi, ou l'entreprise qui limite la chaîne si cela rapporte plus.
const workTarget = (state: GameState): string => {
  const job = jobById(state.jobId);
  const jobGain = job?.salary ?? 0;
  const { commerce } = capacities(state);
  const isNeedsStock = state.stock < commerce;
  let best = { target: JOB_TARGET, gain: jobGain };
  for (const company of companies) {
    const copies = ownedCount(state, company.id);
    if (copies === 0 || (company.kind === 'production') !== isNeedsStock) {
      continue;
    }
    const units =
      (company.kind === 'production' ? company.output : company.capacity) *
      copies *
      (state.companyMultipliers[company.id] ?? 1);
    // Une action de travail ajoute `workBonus` de l'activité de l'entreprise.
    const gain =
      economyRules.workBonus *
      units *
      (company.kind === 'commerce'
        ? company.price
        : simulatorConfig.articleValue);
    if (gain > best.gain && canWork(state, company.id)) {
      best = { target: company.id, gain };
    }
  }
  return best.target;
};

/**
 * Le joueur virtuel : une stratégie gloutonne et déterministe. Il active
 * l'automatisation dès qu'elle est possible, achète le moins cher des achats
 * utiles, accepte les promotions, étudie la stat qui bloque le prochain achat, sinon travaille. Le
 * sommeil vient seul quand les marqueurs sont pleins : il attend alors.
 *
 * Une fois le travail automatique actif, il lâche la souris (ADR 0005) : il
 * ne fait plus que des achats. Il rend `undefined` quand il attend.
 *
 * `excluded` liste des améliorations qu'il n'achète jamais (test d'utilité).
 */
export const chooseAction = (
  state: GameState,
  excluded: ReadonlySet<string> = new Set(),
): GameAction | undefined => {
  // Une promotion arrête le jeu : le joueur virtuel l'accepte toujours.
  if (state.pendingBirthday !== null) {
    return { type: 'answerBirthday' };
  }
  if (state.pendingPromotion !== null) {
    return { type: 'answerPromotion', isAccepted: false };
  }
  if (canEnableAuto(state, 'work') && !isAutoActive(state, 'work')) {
    return { type: 'setAuto', action: 'work', isEnabled: true };
  }
  const purchase = nextPurchase(state, excluded);
  if (purchase !== undefined) {
    return purchase;
  }
  if (isAutoActive(state, 'work')) {
    return undefined;
  }
  const stat = neededStat(state, excluded);
  const course = courses.find((candidate) => candidate.stat === stat);
  if (
    course !== undefined &&
    state.markers.length < state.maxMarkers &&
    state.money >=
      Math.max(simulatorConfig.studyReserve * course.cost, reserveOf(state)) &&
    canStudy(state, course.id)
  ) {
    return { type: 'study', courseId: course.id };
  }
  const { commerce } = capacities(state);
  return commerce === 0 &&
    canSellSurplus(state) &&
    state.stock >= 0.8 * state.stockCapacity
    ? { type: 'sellSurplus' }
    : { type: 'work', target: workTarget(state) };
};
