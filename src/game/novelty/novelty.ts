import { canBuyCompany, canBuyWarehouse } from '@game/companies';
import {
  companies,
  districts,
  jobs,
  reputationTiers,
  upgrades,
} from '@game/data';
import type { UpgradeScope } from '@game/data';
import { canUnlockDistrict } from '@game/districts';
import { canChangeJob } from '@game/jobs';
import { canBuyUpgrade } from '@game/upgrades';
import { isUnlocked } from '@game/requirements';
import type { Requirement } from '@game/requirements';
import { reputationTierOf } from '@game/reputation';
import { statIds } from '@game/state';
import type { GameState } from '@game/state';
import { tierOf } from '@game/stats';

// Onglets qui signalent des nouveautés (Courrier a son propre compteur).
export const noveltyTabs = [
  'profile',
  'jobs',
  'companies',
  'upgrades',
  'city',
] as const;

export type NoveltyTab = (typeof noveltyTabs)[number];

type Candidate = { id: string; requirement?: Requirement };

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

// Les améliorations d'une portée, celles que montre la vue contextuelle.
const upgradesOf = (scope: UpgradeScope) =>
  upgrades.filter((upgrade) => upgrade.scope === scope);

const districtIds = (state: GameState) =>
  unlockedIds(state, 'district', districts);

// Achats possibles tout de suite (condition remplie et de quoi payer). Un id
// `buy:` se réarme : il quitte les ids vus dès que l'achat redevient impossible
// (`pruneSeen`), donc il resignale la prochaine fois qu'il devient possible.
const BUY_PREFIX = 'buy:';

const buyableIds = (
  prefix: string,
  candidates: readonly { id: string }[],
  canBuy: (id: string) => boolean,
) =>
  candidates
    .filter((candidate) => canBuy(candidate.id))
    .map((candidate) => `${BUY_PREFIX}${prefix}:${candidate.id}`);

const buyableFor = (state: GameState, tab: NoveltyTab): string[] => {
  const upgradesFor = (candidates: readonly { id: string }[]) =>
    buyableIds('upgrade', candidates, (id) => canBuyUpgrade(state, id));
  const districtsFor = () =>
    buyableIds('district', districts, (id) => canUnlockDistrict(state, id));
  switch (tab) {
    case 'companies': {
      return [
        ...buyableIds('company', companies, (id) => canBuyCompany(state, id)),
        ...(canBuyWarehouse(state) ? [`${BUY_PREFIX}warehouse`] : []),
        ...upgradesFor(upgradesOf('company')),
        ...districtsFor(),
      ];
    }
    case 'upgrades': {
      return upgradesFor(upgrades);
    }
    case 'jobs': {
      return buyableIds('job', jobs, (id) => canChangeJob(state, id));
    }
    case 'city': {
      return districtsFor();
    }
    case 'profile': {
      return upgradesFor(upgradesOf('person'));
    }
  }
};

// Éléments dont la condition est remplie, par onglet. « Débloqué » ne veut pas
// dire « achetable » : l'argent ou la réputation à payer n'entrent pas en jeu.
const unlockedByCondition = (state: GameState, tab: NoveltyTab): string[] => {
  switch (tab) {
    case 'companies': {
      return [
        ...unlockedIds(state, 'company', companies),
        ...unlockedIds(state, 'upgrade', upgradesOf('company')),
        ...districtIds(state),
      ];
    }
    case 'upgrades': {
      return unlockedIds(state, 'upgrade', upgrades);
    }
    case 'jobs': {
      return unlockedIds(state, 'job', jobs);
    }
    case 'city': {
      return districtIds(state);
    }
    case 'profile': {
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
      return [
        ...stats,
        ...reputation,
        ...unlockedIds(state, 'upgrade', upgradesOf('person')),
      ];
    }
  }
};

// Débloqués par leur condition, plus achetables maintenant.
const unlockedFor = (state: GameState, tab: NoveltyTab): string[] => [
  ...unlockedByCondition(state, tab),
  ...buyableFor(state, tab),
];

const unseenItems = (state: GameState, tab: NoveltyTab) => {
  const seen = new Set(state.seenItems[tab]);
  return unlockedFor(state, tab).filter((id) => !seen.has(id));
};

// Ids débloqués dans l'onglet et pas encore vus. Un élément qui se débloque et
// devient achetable d'un coup ne compte qu'une fois.
export const newItems = (state: GameState, tab: NoveltyTab): string[] => {
  const unseen = unseenItems(state, tab);
  const ids = new Set(unseen);
  return unseen.filter(
    (id) => !id.startsWith(BUY_PREFIX) || !ids.has(id.slice(BUY_PREFIX.length)),
  );
};

// Le joueur a ouvert l'onglet : tout ce qui est débloqué est vu. Ce qui est vu
// le reste, même si la condition cesse d'être remplie.
export const markSeen = (state: GameState, tab: NoveltyTab): GameState => {
  const fresh = unseenItems(state, tab);
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

// Les achats redevenus impossibles ne sont plus « vus » : ils signaleront de
// nouveau quand ils redeviendront possibles. L'état est rendu tel quel s'il n'y
// a rien à retirer (appelé après chaque action).
export const pruneSeen = (state: GameState): GameState => {
  let seenItems = state.seenItems;
  for (const tab of noveltyTabs) {
    const buyable = new Set(buyableFor(state, tab));
    const kept = seenItems[tab].filter(
      (id) => !id.startsWith(BUY_PREFIX) || buyable.has(id),
    );
    if (kept.length !== seenItems[tab].length) {
      seenItems = { ...seenItems, [tab]: kept };
    }
  }
  return seenItems === state.seenItems ? state : { ...state, seenItems };
};

// Tous les onglets vus (nouvelle vie, migration d'une partie en cours).
export const markAllSeen = (state: GameState): GameState => {
  let seen = state;
  for (const tab of noveltyTabs) {
    seen = markSeen(seen, tab);
  }
  return seen;
};
