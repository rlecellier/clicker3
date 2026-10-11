import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useGameContext } from '@context/GameContext';
import { formatDate } from '@game/format';
import { dateOf } from '@game/time';
import { gamePath } from '@hook/useGameTabs';
import { readingTime } from './readingTime';

const MAIL_PATH = gamePath('courrier');

// Popup de courrier : signale un message qui arrive pendant la partie, sans
// jamais le marquer comme lu (seul l'onglet Courrier le fait). Une seule popup
// à la fois : le message le plus récent remplace le précédent et compte les
// autres. Pas de popup sur l'onglet Courrier, ni pour ce qui est arrivé avant
// l'ouverture de l'écran (absence). Le délai de fermeture est un minuteur
// d'interface, suspendu au survol et au focus.
export const useMailPopup = () => {
  const { state } = useGameContext();
  const { pathname } = useLocation();
  const isMailOpen = pathname === MAIL_PATH;

  const [seen, setSeen] = useState(state.mailReceived);
  // `count` : messages arrivés depuis l'affichage de la popup.
  const [count, setCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  if (state.mailReceived !== seen) {
    setSeen(state.mailReceived);
    const arrived = state.mailReceived - seen;
    if (!isMailOpen && arrived > 0) {
      setCount(count + arrived);
    }
  }
  if (isMailOpen && count > 0) {
    setCount(0);
  }

  const latest = state.events.at(-1);
  const isVisible = count > 0 && latest !== undefined;
  const text = latest?.text ?? '';

  useEffect(() => {
    if (!isVisible || isPaused) {
      return;
    }
    const timer = setTimeout(() => {
      setCount(0);
    }, readingTime(text));
    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, isPaused, text, count]);

  if (!isVisible) {
    return null;
  }
  return {
    date: formatDate(dateOf({ ...state, period: latest.period })),
    text,
    otherCount: count - 1,
    mailPath: MAIL_PATH,
    onDismiss: () => {
      setCount(0);
      setIsPaused(false);
    },
    onPause: () => {
      setIsPaused(true);
    },
    onResume: () => {
      setIsPaused(false);
    },
  };
};
