import type { Requirement } from '@game/requirements';
import type { GameDate } from '@game/time';
import type { GameState, LifePhase, StatId } from '@game/state';
import { isSenior } from '@game/phases';
import { reputationTiers, statTierThresholds } from '@game/data';
import { isUnlocked } from '@game/requirements';
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
