import { useSyncExternalStore } from 'react';

// Seuil mobile de l'ADR 0008 : même valeur (40 rem) que dans les media queries
// des CSS Modules, qui ne peuvent pas lire une variable.
const query = '(max-width: 40rem)';

const hasMatchMedia = () => typeof matchMedia === 'function';

const subscribe = (onChange: () => void) => {
  if (!hasMatchMedia()) {
    return () => {};
  }
  const media = matchMedia(query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const getSnapshot = () => hasMatchMedia() && matchMedia(query).matches;

// Écran étroit (téléphone) : barre des tâches plutôt que sidebar.
export const useIsCompact = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
