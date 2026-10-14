import { useGameContext } from '@context/GameContext';
import type { ListItem } from '@component/ItemList';
import { childAxes, childObjects, findById } from '@game/data';
import {
  activityPole,
  availableActivities,
  isChildhoodOver,
} from '@game/earlyChildhood';
import { MAX_FAVORITES, useFavorites } from '@hook/useFavorites';
import { useGameActions } from '@hook/useGameActions';

const KNOW_HOW = 'Savoir-faire';

// Onglet « Maison » : toutes les activités possibles, groupées par objet ou
// par savoir-faire, chacune pouvant être mise en favori pour l'écran Vie.
export const useHouseScreen = () => {
  const { state } = useGameContext();
  const actions = useGameActions();
  const { favorites, toggle, isFull } = useFavorites();
  const isOver = isChildhoodOver(state);

  const sections = new Map<string, ListItem[]>();
  for (const activity of availableActivities(state)) {
    const axis = findById(childAxes, activity.axis);
    if (axis === undefined) {
      continue;
    }
    const caption =
      activity.source.type === 'object'
        ? (findById(childObjects, activity.source.id)?.name ?? KNOW_HOW)
        : KNOW_HOW;
    const isFavorite = favorites.includes(activity.id);
    const item: ListItem = {
      id: activity.id,
      title: activity.name,
      detail: `${axis.name} → ${activityPole(activity, axis)}`,
      actionLabel: 'Jouer',
      isDisabled: isOver,
      onAction: () => {
        actions.doActivity(activity.id);
      },
      extraActions: [
        {
          id: 'favorite',
          label: isFavorite ? '★ Retirer' : '☆ Favori',
          isDisabled: !isFavorite && isFull,
          onAction: () => {
            toggle(activity.id);
          },
        },
      ],
    };
    sections.set(caption, [...(sections.get(caption) ?? []), item]);
  }

  return {
    sections: [...sections].map(([caption, items]) => ({ caption, items })),
    favoritesText: `Favoris : ${favorites.length} sur ${MAX_FAVORITES} au plus. Ils s’affichent sur l’écran Vie.`,
  };
};
