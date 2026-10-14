import { birthSituations, childRules, findById } from '@game/data';
import type { ChildActivity, Parent } from '@game/data';
import type { ChildAxisId, GameState, Relation } from '@game/state';

const { relations: rules } = childRules;

// Ce que l'ami aime partager : jouer, avec ceux qui parlent.
const friendPassion = {
  axis: 'sociability',
  direction: 1,
  text: 'aime jouer',
} as const;

// Les parents de la situation de naissance, avec un lien de départ qui est une
// part (30 %) de leur affection : un bébé ne joue pas encore avec eux.
export const initialRelations = (situationId: string): Relation[] =>
  (findById(birthSituations, situationId)?.parents ?? []).map((parent) => ({
    id: parent.id,
    name: parent.name,
    role: parent.role,
    kind: 'family',
    bond: Math.round(parent.qualities.affection * rules.startShare),
  }));

export const relationById = (state: GameState, id: string) =>
  findById(state.relations, id);

const parentOf = (state: GameState, id: string): Parent | undefined =>
  findById(birthSituations, state.birthSituation)?.parents.find(
    (parent) => parent.id === id,
  );

// Ce que la personne aime partager (`undefined` si on ne le sait pas).
export const passionOf = (
  state: GameState,
  relation: Relation,
): { axis: ChildAxisId; direction: 1 | -1; text: string } | undefined =>
  relation.kind === 'friend'
    ? friendPassion
    : parentOf(state, relation.id)?.passion;

// Palier d'un lien : 0 (distant), 1 (activité), 2 (bonus), 3 (soutien).
export const bondTier = (bond: number) => {
  const { activity, bonus, support } = rules.tiers;
  if (bond >= support) {
    return 3;
  }
  if (bond >= bonus) {
    return 2;
  }
  return bond >= activity ? 1 : 0;
};

const clampBond = (value: number) => Math.max(0, Math.min(100, value));

// Un proche au lien très fort amortit les mauvaises passes : une perte de lien
// est alors divisée par deux (arrondie à l'inférieur).
const hasSupport = (state: GameState) =>
  state.relations.some(
    ({ kind, bond }) => kind === 'family' && bond >= rules.tiers.support,
  );

// Le lien avec une personne monte ou descend, entre 0 et 100. Une personne
// inconnue est ignorée.
export const changeBond = (
  state: GameState,
  id: string,
  amount: number,
): GameState => {
  if (relationById(state, id) === undefined) {
    return state;
  }
  const delta =
    amount < 0 && hasSupport(state) ? Math.ceil(amount / 2) : amount;
  return {
    ...state,
    relations: state.relations.map((relation) =>
      relation.id === id
        ? { ...relation, bond: clampBond(relation.bond + delta) }
        : relation,
    ),
  };
};

// Un premier ami entre dans la vie de l'enfant (une seule fois).
export const meetFriend = (
  state: GameState,
  name: string,
  bond: number,
): GameState =>
  state.relations.some(({ kind }) => kind === 'friend')
    ? state
    : {
        ...state,
        relations: [
          ...state.relations,
          {
            id: 'friend',
            name,
            role: 'ami',
            kind: 'friend',
            bond: clampBond(bond),
          },
        ],
      };

export const hasFriend = (state: GameState) =>
  state.relations.some(({ kind }) => kind === 'friend');

// Les activités à faire avec une personne : elles s'ouvrent au premier palier
// de lien, et poussent l'axe qu'elle aime partager.
export const relationActivities = (state: GameState): ChildActivity[] =>
  state.relations
    .filter(({ bond }) => bond >= rules.tiers.activity)
    .map((relation) => ({ relation, passion: passionOf(state, relation) }))
    .filter((entry) => entry.passion !== undefined)
    .map(({ relation, passion }) => ({
      id: `with:${relation.id}`,
      name: `Jouer avec ${relation.name}`,
      axis: passion?.axis ?? 'sociability',
      direction: passion?.direction ?? 1,
      amount: 3,
      source: { type: 'relation', person: relation.id },
    }));

// À chaque trimestre, une personne assez proche pousse en douce l'axe qu'elle
// aime partager.
export const applyBondBonuses = (state: GameState): GameState => {
  let next = state;
  for (const relation of state.relations) {
    const passion = passionOf(state, relation);
    if (passion === undefined || relation.bond < rules.tiers.bonus) {
      continue;
    }
    const { axes } = next.child;
    const limit = childRules.axisLimit;
    const value = axes[passion.axis] + passion.direction * rules.bonusAmount;
    next = {
      ...next,
      child: {
        ...next.child,
        axes: {
          ...axes,
          [passion.axis]: Math.max(-limit, Math.min(limit, value)),
        },
      },
    };
  }
  return next;
};
