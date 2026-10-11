import { canEnableAuto, isAutoActive } from '@game/automation';
import { canBuyCompany, companyCost, ownedCount } from '@game/companies';
import { companies, courses, districts, jobs, upgrades } from '@game/data';
import type { Company } from '@game/data';
import { canUnlockDistrict } from '@game/districts';
import { canChangeJob, jobById } from '@game/jobs';
import { lastPeriodReport } from '@game/ledger';
import type { GameAction } from '@game/reducer';
import type { Requirement } from '@game/requirements';
import { canSleep } from '@game/sleep';
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

// Stat à travailler : le premier palier qui manque pour l'achat le moins cher
// dont on peut étudier la stat (une formation achetée).
const neededStat = (state: GameState): StatId | undefined => {
  const goals = [
    ...upgrades
      .filter((upgrade) => !isOwned(state, upgrade.id))
      .map((upgrade) => ({
        cost: upgrade.price,
        requirement: upgrade.requirement,
      })),
    ...companies.map((company) => ({
      cost: companyCost(company.id, ownedCount(state, company.id)),
      requirement: company.requirement,
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

// Un achat qui alourdit loyer ou salaires doit rester couvert par les recettes.
const isCovered = (state: GameState, extra: number) =>
  extra === 0 ||
  lastPeriodReport(state).revenue >=
    simulatorConfig.expenseCover * (state.rent + state.payroll + extra);

type Purchase = { cost: number; action: GameAction };

const nextPurchase = (state: GameState): GameAction | undefined => {
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
        canBuyUpgrade(state, upgrade.id) &&
        isCovered(state, (upgrade.rent ?? 0) + (upgrade.payroll ?? 0)),
    )
    .map((upgrade) => ({
      cost: upgrade.price,
      action: { type: 'buyUpgrade', id: upgrade.id },
    }));
  const company = wantedCompany(state);
  if (company !== undefined) {
    purchases.push({
      cost: companyCost(company.id, ownedCount(state, company.id)),
      action: { type: 'buyCompany', id: company.id },
    });
  }
  // Le moins cher d'abord.
  return purchases.toSorted((first, second) => first.cost - second.cost)[0]
    ?.action;
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
      0.5 *
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
 * utiles, dort quand les marqueurs sont pleins, étudie la stat qui bloque le
 * prochain achat, sinon travaille.
 *
 * Une fois le travail automatique actif, il lâche la souris (ADR 0005) : il
 * ne fait plus que des achats et dort quand les marqueurs sont pleins, faute
 * de sommeil automatique. Il rend `undefined` quand il attend l'automatisation.
 */
export const chooseAction = (state: GameState): GameAction | undefined => {
  for (const action of ['work', 'sleep'] as const) {
    if (canEnableAuto(state, action) && !isAutoActive(state, action)) {
      return { type: 'setAuto', action, isEnabled: true };
    }
  }
  const purchase = nextPurchase(state);
  if (purchase !== undefined) {
    return purchase;
  }
  if (
    state.markers.length >= state.maxMarkers &&
    canSleep(state) &&
    !isAutoActive(state, 'sleep')
  ) {
    return { type: 'sleep' };
  }
  if (isAutoActive(state, 'work')) {
    return undefined;
  }
  const stat = neededStat(state);
  const course = courses.find((candidate) => candidate.stat === stat);
  if (
    course !== undefined &&
    state.markers.length < state.maxMarkers &&
    state.money >= simulatorConfig.studyReserve * course.cost &&
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
