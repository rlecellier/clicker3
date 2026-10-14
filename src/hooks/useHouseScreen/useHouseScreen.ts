import { useGameContext } from '@context/GameContext';
import type { ListItem } from '@component/ItemList';
import { MAX_FAVORITES, useFavorites } from '@hook/useFavorites';
import { useFeedback } from '@hook/useFeedback';
import { houseEntries } from '@view/houseEntries';

// Onglet « Maison » : tout ce que l'enfant peut faire, groupé par objet ou par
// rubrique, chaque ligne pouvant être mise en favori pour l'écran Vie.
export const useHouseScreen = () => {
  const { state, dispatch } = useGameContext();
  const { favorites, toggle, isFull } = useFavorites();
  const { feedback, say } = useFeedback();

  const sections = new Map<string, ListItem[]>();
  for (const entry of houseEntries(state)) {
    const isFavorite = favorites.includes(entry.id);
    const run = () => {
      dispatch(entry.action);
    };
    const item: ListItem = {
      id: entry.id,
      title: entry.title,
      detail: entry.detail,
      actionLabel: entry.actionLabel,
      isDisabled: entry.isDisabled,
      reason: entry.reason,
      onAction: entry.feedback === undefined ? run : say(entry.feedback, run),
      extraActions: [
        {
          id: 'favorite',
          label: isFavorite ? '★ Retirer' : '☆ Favori',
          isDisabled: !isFavorite && isFull,
          onAction: () => {
            toggle(entry.id);
          },
        },
      ],
    };
    sections.set(entry.group, [...(sections.get(entry.group) ?? []), item]);
  }

  return {
    sections: [...sections].map(([caption, items]) => ({ caption, items })),
    favoritesText: `Favoris : ${favorites.length} sur ${MAX_FAVORITES} au plus. Ils s’affichent sur l’écran Vie.`,
    feedback,
  };
};
