import { useState } from 'react';
import { useGameContext } from '@context/GameContext';
import { childObjects, findById } from '@game/data';
import { tabPath } from '@hook/useGameTabs';
import { objectDetail } from '@view/objectDetail';

// Page « Inventaire » : tous les objets en grille, et la fiche de celui qu'on
// choisit au-dessus.
export const useInventoryScreen = () => {
  const { state } = useGameContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = state.child.objects
    .map((id) => findById(childObjects, id))
    .filter((object) => object !== undefined)
    .map(({ id, name, icon }) => ({ id, name, icon }));
  // Un objet perdu entre-temps n'est plus sélectionné.
  const detail =
    selectedId !== null && items.some(({ id }) => id === selectedId)
      ? objectDetail(selectedId)
      : undefined;
  return {
    items,
    selectedId: detail === undefined ? null : selectedId,
    select: setSelectedId,
    detail,
    backPath: tabPath('house'),
  };
};
