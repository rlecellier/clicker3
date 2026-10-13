import { companies, startState, upgrades } from '@game/data';
import { impactOf } from '@game/impact';
import { totals } from '@game/ledger';
import { capitalOf } from '@game/placements';
import type { ImpactReport } from '@game/impact';
import type { GameState } from '@game/state';
import { ageOf } from '@game/time';

// Les chiffres simples de la vie, peu coûteux : ils servent aussi aux textes
// des événements.
export type LifeFigures = {
  age: number;
  companies: number;
  money: number;
  reputation: number;
};

export type LifeSummary = LifeFigures & {
  // Capital placé, compris dans `money` (total de tous les comptes).
  capital: number;
  // Total de l'argent gagné sur toute la vie (recettes cumulées), quoi qu'il
  // en soit resté à la fin.
  earned: number;
  // Exemplaires d'entreprises possédés sur le total possible (`maxCopies`).
  companiesTotal: number;
  // Améliorations achetées sur le total d'améliorations.
  upgradesOwned: number;
  upgradesTotal: number;
  // Nom du logement où l'on vit.
  housing: string;
  // Pollution et inégalités de la ville et de ses quartiers (ADR 0004).
  impact: ImpactReport;
};

export const lifeFigures = (state: GameState): LifeFigures => ({
  age: ageOf(state),
  companies: Object.values(state.companies).reduce(
    (total, count) => total + count,
    0,
  ),
  money: state.money,
  reputation: state.reputation,
});

// Nom du logement actuel : celui de l'amélioration de logement achetée, sinon
// le studio de départ.
export const housingName = (state: GameState) =>
  upgrades.find((upgrade) =>
    upgrade.effects.some(
      (effect) =>
        effect.type === 'housing' && effect.housingId === state.housingId,
    ),
  )?.name ??
  (state.housingId === startState.housingId ? 'Studio' : state.housingId);

// Bilan de fin de partie, calculé depuis l'état.
export const lifeSummary = (state: GameState): LifeSummary => ({
  ...lifeFigures(state),
  capital: capitalOf(state),
  earned: totals(state).revenue,
  companiesTotal: companies.reduce(
    (total, company) => total + company.maxCopies,
    0,
  ),
  upgradesOwned: state.upgrades.length,
  upgradesTotal: upgrades.length,
  housing: housingName(state),
  impact: impactOf(state),
});
