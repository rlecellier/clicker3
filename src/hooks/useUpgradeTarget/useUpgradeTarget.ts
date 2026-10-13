import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { itemElementId } from '@component/ItemList';
import { UPGRADE_PARAM } from '@hook/useGameTabs';

const HIGHLIGHT_MS = 4000;
const AVAILABLE_TAB = 'available';

// Sous-onglet d'Améliorations et amélioration visée par l'URL
// (`?amelioration=<id>`) : ouvre « À acheter », fait défiler jusqu'à la ligne
// et la met en évidence quelques secondes.
export const useUpgradeTarget = () => {
  const [searchParameters] = useSearchParams();
  const target = searchParameters.get(UPGRADE_PARAM);
  const [tab, setTab] = useState(AVAILABLE_TAB);
  const [highlightedId, setHighlightedId] = useState<string | undefined>(
    target ?? undefined,
  );

  useEffect(() => {
    if (target === null) {
      return;
    }
    const timer = setTimeout(() => {
      setHighlightedId(undefined);
    }, HIGHLIGHT_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [target]);

  // Le défilement attend que le panneau soit affiché.
  useEffect(() => {
    if (highlightedId === undefined || tab !== AVAILABLE_TAB) {
      return;
    }
    const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .querySelector(`#${CSS.escape(itemElementId(highlightedId))}`)
      ?.scrollIntoView({
        block: 'center',
        behavior: isReduced ? 'auto' : 'smooth',
      });
  }, [highlightedId, tab]);

  return { tab, setTab, highlightedId };
};
