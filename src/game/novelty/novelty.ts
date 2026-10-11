import {
  companies,
  districts,
  jobs,
  reputationTiers,
  statTierThresholds,
  upgrades,
} from '@game/data';
import { isUnlocked } from '@game/requirements';
import type { Requirement } from '@game/requirements';
import { reputationTierOf } from '@game/reputation';
import type { GameState, StatId } from '@game/state';
import { tierOf } from '@game/stats';

// Onglets qui signalent des nouveautés (Courrier a son propre compteur).
export const noveltyTabs = ['skills', 'jobs', 'invest', 'city'] as const;

export type NoveltyTab = (typeof noveltyTabs)[number];

type Candidate = { id: string; requirement?: Requirement };

const statIds = Object.keys(statTierThresholds) as StatId[];

// Un élément sans condition est ouvert dès le départ : il n'a rien de nouveau.
const unlockedIds = (
  state: GameState,
  prefix: string,
  candidates: readonly Candidate[],
) =>
  candidates
    .filter(
      (candidate) =>
        candidate.requirement !== undefined &&
        isUnlocked(state, candidate.requirement),
    )
    .map((candidate) => `${prefix}:${candidate.id}`);

const districtIds = (state: GameState) =>
  unlockedIds(state, 'district', districts);

// Éléments dont la condition est remplie, par onglet. « Débloqué » ne veut pas
// dire « achetable » : l'argent ou la réputation à payer n'entrent pas en jeu.
const unlockedFor = (state: GameState, tab: NoveltyTab): string[] => {
  switch (tab) {
    case 'invest': {
      return [
        ...unlockedIds(state, 'company', companies),
        ...unlockedIds(state, 'upgrade', upgrades),
        ...districtIds(state),
      ];
    }
    case 'jobs': {
      return unlockedIds(state, 'job', jobs);
    }
    case 'city': {
      return districtIds(state);
    }
    case 'skills': {
      const stats = statIds.flatMap((stat) =>
        Array.from(
          { length: tierOf(state, stat) },
          (_, index) => `stat:${stat}:${index + 1}`,
        ),
      );
      const reputation = Array.from(
        { length: Math.min(reputationTierOf(state), reputationTiers.length) },
        (_, index) => `reputation:${index + 1}`,
      );
      return [...stats, ...reputation];
    }
  }
};

// Ids débloqués dans l'onglet et pas encore vus.
export const newItems = (state: GameState, tab: NoveltyTab): string[] => {
  const seen = new Set(state.seenItems[tab]);
  return unlockedFor(state, tab).filter((id) => !seen.has(id));
};

// Le joueur a ouvert l'onglet : tout ce qui est débloqué est vu. Ce qui est vu
// le reste, même si la condition cesse d'être remplie.
export const markSeen = (state: GameState, tab: NoveltyTab): GameState => {
  const fresh = newItems(state, tab);
  return fresh.length === 0
    ? state
    : {
        ...state,
        seenItems: {
          ...state.seenItems,
          [tab]: [...state.seenItems[tab], ...fresh],
        },
      };
};

// Tous les onglets vus (nouvelle vie, migration d'une partie en cours).
export const markAllSeen = (state: GameState): GameState => {
  let seen = state;
  for (const tab of noveltyTabs) {
    seen = markSeen(seen, tab);
  }
  return seen;
};
