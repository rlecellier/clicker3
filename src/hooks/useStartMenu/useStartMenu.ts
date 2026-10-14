import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

// État du menu Démarrer : se ferme à `Échap` et dès que l'on change d'onglet.
export const useStartMenu = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openPath, setOpenPath] = useState(pathname);

  // Changer de page (lien, raccourci clavier, retour arrière) ferme le menu.
  if (openPath !== pathname) {
    setOpenPath(pathname);
    setIsOpen(false);
  }

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return { isOpen, toggle, close };
};
