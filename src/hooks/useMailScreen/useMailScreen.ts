import { useEffect, useState } from 'react';
import { useGameContext } from '@context/GameContext';
import { unreadMail } from '@game/mail';
import { journalEntry } from '@view/journal';

// Courrier : le journal, du plus récent au plus ancien. Ouvrir l'onglet lit le
// courrier, y compris les messages qui arrivent pendant qu'il est ouvert.
export const useMailScreen = () => {
  const { state, dispatch } = useGameContext();
  const unread = unreadMail(state);

  // Les messages non lus à l'ouverture, et ceux reçus depuis, restent mis en
  // avant même une fois lus.
  const [readAtOpening] = useState(state.mailRead);
  const fresh = state.mailReceived - readAtOpening;

  useEffect(() => {
    if (unread > 0) {
      dispatch({ type: 'readMail' });
    }
  }, [unread, dispatch]);

  const entries = state.events
    .toReversed()
    .map((entry, index) => journalEntry(state, entry, index < fresh));

  return { entries };
};
