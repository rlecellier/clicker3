import { useGameContext } from '@context/GameContext';
import type { InfoListItem } from '@component/ItemList';
import { childAxes, childRules, findById } from '@game/data';
import { hasFriend, passionOf } from '@game/relations';
import type { GameState, Relation } from '@game/state';

const { tiers } = childRules.relations;

const personItem = (state: GameState, relation: Relation): InfoListItem => {
  const passion = passionOf(state, relation);
  const axis = findById(childAxes, passion?.axis);
  const pole = passion?.direction === 1 ? axis?.positive : axis?.negative;
  return {
    id: relation.id,
    title: `${relation.name} (${relation.role})`,
    detail: `Lien : ${relation.bond} sur 100. ${passion?.text ?? ''}`.trim(),
    conditions: [
      {
        label: `Jouer avec ${relation.name} (lien ${tiers.activity})`,
        isMet: relation.bond >= tiers.activity,
      },
      {
        label:
          axis === undefined || pole === undefined
            ? `Pousse un axe en douce (lien ${tiers.bonus})`
            : `Pousse ${axis.name} → ${pole} en douce (lien ${tiers.bonus})`,
        isMet: relation.bond >= tiers.bonus,
      },
      {
        label: `Amortit les mauvaises passes (lien ${tiers.support})`,
        isMet: relation.bond >= tiers.support,
      },
    ],
  };
};

// Onglet « Relations » : un sous-menu, Famille d'abord, puis Amis quand le
// premier ami apparaît. D'autres sections s'ajouteront sans refonte.
export const useRelationsScreen = () => {
  const { state } = useGameContext();
  const family = state.relations.filter(({ kind }) => kind === 'family');
  const friends = state.relations.filter(({ kind }) => kind === 'friend');
  return {
    sections: [
      {
        id: 'family',
        label: 'Famille',
        items: family.map((relation) => personItem(state, relation)),
      },
      ...(hasFriend(state)
        ? [
            {
              id: 'friends',
              label: 'Amis',
              items: friends.map((relation) => personItem(state, relation)),
            },
          ]
        : []),
    ],
  };
};
