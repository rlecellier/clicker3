import type { Activity } from '@game/activity';
import type { Requirement } from '@game/requirements';
import { dateAt } from '@game/time';
import type { GameDate } from '@game/time';
import type { GameState, LifePhase, StatId } from '@game/state';
import { isSenior } from '@game/phases';
import { companyById } from '@game/companies';
import { reputationTiers, statTierThresholds } from '@game/data';
import type { Boost, UpgradeEffect } from '@game/data';
import { isUnlocked } from '@game/requirements';
import { courseById } from '@game/study';
import { upgradeById } from '@game/upgrades';

const money = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const count = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export const formatMoney = (amount: number) => money.format(amount);

// Entier avec séparateur de milliers (stock, points).
export const formatCount = (value: number) => count.format(value);

// Un chiffre après la virgule au plus (réputation).
export const formatDecimal = (value: number) => decimal.format(value);

const compactUnits = [
  { from: 1e12, suffix: 'Bn' },
  { from: 1e9, suffix: 'Md' },
  { from: 1e6, suffix: 'M' },
  { from: 1e3, suffix: 'k' },
] as const;

// Grand nombre abrégé : 1 000 → « 1k », 1 250 000 → « 1,2M ». Une décimale au
// plus, tronquée (jamais arrondie à la hausse) ; sous 1 000, entier exact.
export const formatCompact = (value: number) => {
  const sign = value < 0 ? '-' : '';
  const size = Math.abs(value);
  const unit = compactUnits.find(({ from }) => size >= from);
  if (unit === undefined) {
    return `${sign}${count.format(Math.trunc(size))}`;
  }
  const scaled = Math.trunc(size / (unit.from / 10)) / 10;
  return `${sign}${decimal.format(scaled)}${unit.suffix}`;
};

export const formatCompactMoney = (amount: number) =>
  `${formatCompact(amount)} €`;

// Variation signée (« +120 € », « −45 € »), abrégée comme le reste.
export const formatBalance = (amount: number, unit = '') => {
  const body = `${formatCompact(Math.abs(amount))}${unit}`;
  if (amount > 0) {
    return `+${body}`;
  }
  return amount < 0 ? `−${body}` : body;
};

const months = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

// « janvier 1999 ».
export const formatDate = ({ year, month }: GameDate) =>
  `${months[month - 1] ?? ''} ${year}`;

// Date d'une période de la vie (la période en cours par défaut).
export const formatPeriodDate = (state: GameState, period = state.period) =>
  formatDate(dateAt(state.life, period));

export const formatAge = (age: number) => `${age} ans`;

const phaseLabels: Record<LifePhase, string> = {
  youngAdult: 'Jeune actif en devenir',
  entrepreneur: 'Entrepreneur (statut déclaré)',
  boss: 'Dirigeant (sans équipe de direction)',
};

// Phase de vie en version satirique ; la vieillesse se cumule avec la phase.
export const formatPhase = (state: GameState) =>
  isSenior(state)
    ? `${phaseLabels[state.phase]}, senior`
    : phaseLabels[state.phase];

export const statLabels: Record<StatId, string> = {
  metier: 'Métier',
  gestion: 'Gestion',
  intelligence: 'Intelligence',
  endurance: 'Endurance',
};

// Ce que fait le personnage, en quelques mots, pour l'en-tête.
export const activityLabels: Record<Activity, string> = {
  work: 'Au travail',
  study: 'En formation',
  idle: 'Entre deux réunions',
  over: 'Plus joignable',
};

// Raison lisible d'un déblocage manquant (« Palier Gestion 2 requis »).
export const describeRequirement = (requirement: Requirement): string => {
  switch (requirement.type) {
    case 'stat': {
      return `Palier ${statLabels[requirement.stat]} ${requirement.tier} requis`;
    }
    case 'reputation': {
      return `Réputation ${formatCount(requirement.min)} requise`;
    }
    case 'reputationTier': {
      return `Palier de réputation ${requirement.tier} requis`;
    }
    case 'district': {
      return 'Quartier à débloquer';
    }
    case 'phase': {
      return `Phase « ${phaseLabels[requirement.phase]} » requise`;
    }
    case 'age': {
      return `${formatAge(requirement.min)} requis`;
    }
    case 'period': {
      return 'Trop tôt';
    }
    case 'company': {
      return 'Entreprise requise';
    }
    case 'upgrade': {
      return 'Amélioration requise';
    }
    case 'dead':
    case 'statement': {
      return 'Condition particulière';
    }
    case 'all':
    case 'any': {
      return requirement.of
        .map((part) => describeRequirement(part))
        .join(requirement.type === 'all' ? ' · ' : ' ou ');
    }
  }
};

export type RequirementCheck = { label: string; isMet: boolean };

// Libellé d'une condition, avec la progression du joueur quand elle se chiffre.
const describeCheck = (state: GameState, requirement: Requirement): string => {
  switch (requirement.type) {
    case 'reputationTier': {
      const tier = reputationTiers[requirement.tier];
      return tier === undefined
        ? describeRequirement(requirement)
        : `Palier de réputation ${requirement.tier} « ${tier.name} » : ${formatCount(state.reputationEarned)} / ${formatCount(tier.earned)} de réputation gagnée`;
    }
    case 'stat': {
      const needed = statTierThresholds[requirement.stat][requirement.tier - 1];
      return needed === undefined
        ? describeRequirement(requirement)
        : `Palier ${statLabels[requirement.stat]} ${requirement.tier} : ${formatCount(state.stats[requirement.stat])} / ${formatCount(needed)} pts`;
    }
    case 'reputation': {
      return `Réputation : ${formatDecimal(state.reputation)} / ${formatCount(requirement.min)}`;
    }
    case 'upgrade': {
      return `Amélioration « ${upgradeById(requirement.id)?.name ?? requirement.id} »`;
    }
    default: {
      return describeRequirement(requirement);
    }
  }
};

// Les conditions à remplir, une par ligne, chacune avec son état (obtenue ou non).
export const checkRequirement = (
  state: GameState,
  requirement: Requirement,
): RequirementCheck[] =>
  requirement.type === 'all'
    ? requirement.of.flatMap((part) => checkRequirement(state, part))
    : [
        {
          label: describeCheck(state, requirement),
          isMet: isUnlocked(state, requirement),
        },
      ];

// « +15 % » : un bonus additif (0,15) en pourcentage signé.
const formatBonus = (bonus: number) => `+${formatDecimal(bonus * 100)} %`;

// « ×2,5 » : un facteur multiplicatif.
const formatFactor = (factor: number) => `×${formatDecimal(factor)}`;

// Ce que fait un coup de pouce, en chiffres, et pour combien de temps.
export const describeBoost = (boost: Boost): string => {
  const duration = `${formatCount(boost.duration)} mois`;
  switch (boost.kind) {
    case 'markerChance': {
      return `Chance de marqueur ${formatBonus(boost.value)} pendant ${duration}`;
    }
    case 'studyMarkers': {
      return `Étudier donne ${formatCount(1 + boost.value)} chances de marqueur pendant ${duration}`;
    }
    case 'sleepBoost': {
      return `Conversion du sommeil ${formatFactor(1 + boost.value)} pendant ${duration}`;
    }
  }
};

// Ce que fait un effet d'amélioration, en chiffres : quoi est multiplié ou
// ajouté, et sur quoi. Généré depuis les `effects`, jamais écrit à la main.
// Les bonus de production s'additionnent entre eux (pas de produit).
export const describeEffect = (effect: UpgradeEffect): string => {
  switch (effect.type) {
    case 'course': {
      const course = courseById(effect.courseId);
      return course === undefined
        ? 'Étudier donne des marqueurs'
        : `Étudier donne des marqueurs ${statLabels[course.stat]}`;
    }
    case 'housing': {
      return `Conversion du sommeil ${formatFactor(effect.sleepMultiplier)}`;
    }
    case 'sleepMore': {
      return `Sommeil +${formatCount(effect.hours)} h : on apprend mieux, on a moins de temps`;
    }
    case 'sleepLess': {
      return `Sommeil −${formatCount(effect.hours)} h : plus de temps, on apprend pareil`;
    }
    case 'stockCapacity': {
      return `Capacité du stock ${formatFactor(effect.factor)}`;
    }
    case 'maxMarkers': {
      return `Marqueurs maximum +${formatCount(effect.add)}`;
    }
    case 'markerChance': {
      return `Chance de marqueur ${formatBonus(effect.bonus)}`;
    }
    case 'productionBonus': {
      const target =
        effect.companyId === undefined
          ? 'de toutes les entreprises'
          : `de ${companyById(effect.companyId)?.name ?? effect.companyId}`;
      return `Production ${target} ${formatBonus(effect.bonus)}`;
    }
    case 'companyBonus': {
      return `Débit de ${companyById(effect.companyId)?.name ?? effect.companyId} ${formatBonus(effect.bonus)}`;
    }
    case 'salesBonus': {
      return `Ventes ${formatBonus(effect.bonus)}`;
    }
    case 'allBonus': {
      return `Production et ventes de toutes les entreprises ${formatBonus(effect.bonus)}`;
    }
    case 'workReputation': {
      return `Réputation gagnée en travaillant ${formatBonus(effect.bonus)}`;
    }
    case 'reputationPerSale': {
      return `Réputation gagnée par vente ${formatBonus(effect.bonus)}`;
    }
    case 'employee': {
      return 'Un employé de plus';
    }
    case 'automation': {
      return 'Le travail se fait tout seul (mode automatique)';
    }
    case 'dashboard': {
      return 'Affiche le tableau de bord dans les Comptes';
    }
  }
};
