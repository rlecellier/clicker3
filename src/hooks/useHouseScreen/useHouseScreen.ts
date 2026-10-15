import { useGameContext } from '@context/GameContext';
import type { AxisAction } from '@component/AxisActions';
import { childObjects, findById } from '@game/data';
import { MAX_FAVORITES, useFavorites } from '@hook/useFavorites';
import { useFeedback } from '@hook/useFeedback';
import { inventoryPath } from '@hook/useGameTabs';
import { useTapOrHold } from '@hook/useTapOrHold';
import { houseEntries, houseLayout } from '@view/houseEntries';
import type { HouseEntry } from '@view/houseEntries';

// Onglet « Maison » : les objets récupérés, puis tout ce que l'enfant peut
// faire, rangé par axe (pôle négatif à gauche, positif à droite). Un appui
// court joue l'action ; un appui long la met en favori pour l'écran Vie.
export const useHouseScreen = () => {
  const { state, dispatch } = useGameContext();
  const { favorites, toggle, isFull } = useFavorites();
  const { feedback, setFeedback, say } = useFeedback();
  const bind = useTapOrHold();

  const holdOn = (entry: HouseEntry) => () => {
    const isFavorite = favorites.includes(entry.id);
    if (!isFavorite && isFull) {
      setFeedback(
        `${MAX_FAVORITES} favoris au plus : retirez-en un d’abord, par un appui long.`,
      );
      return;
    }
    toggle(entry.id);
    setFeedback(
      isFavorite
        ? `« ${entry.title} » n’est plus en favori.`
        : `« ${entry.title} » est en favori : il s’affiche sur la Vie.`,
    );
  };

  const toAction = (entry: HouseEntry): AxisAction => {
    const run = () => {
      dispatch(entry.action);
    };
    const { press, onClick } = bind({
      onTap: entry.feedback === undefined ? run : say(entry.feedback, run),
      onHold: holdOn(entry),
    });
    const isFavorite = favorites.includes(entry.id);
    return {
      id: entry.id,
      label: isFavorite ? `★ ${entry.title}` : entry.title,
      // La colonne dit déjà le pôle : seules les actions hors axe ont un détail.
      detail: entry.axis === undefined ? entry.detail : undefined,
      reason: entry.reason,
      isDisabled: entry.isDisabled,
      press,
      onClick,
    };
  };

  const layout = houseLayout(houseEntries(state));

  return {
    objects: state.child.objects
      .map((id) => findById(childObjects, id))
      .filter((object) => object !== undefined)
      .map(({ id, name, icon }) => ({ id, name, icon })),
    inventoryPath,
    hint: `Appui court : jouer. Appui long : mettre en favori (${favorites.length} sur ${MAX_FAVORITES} au plus), pour l’écran Vie.`,
    feedback,
    axes: layout.axes.map((section) => ({
      id: section.axisId,
      name: section.name,
      negativePole: section.negativePole,
      positivePole: section.positivePole,
      negative: section.negative.map((entry) => toAction(entry)),
      positive: section.positive.map((entry) => toAction(entry)),
    })),
    others: layout.others.map((section) => ({
      caption: section.caption,
      actions: section.entries.map((entry) => toAction(entry)),
    })),
  };
};
