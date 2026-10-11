import { useEffect, useState } from 'react';
import type { EventLogEntry } from '@component/EventLog';
import { useGameContext } from '@context/GameContext';
import { formatDate } from '@game/format';
import { unreadMail } from '@game/mail';
import type { JournalEntry } from '@game/state';
import { dateOf } from '@game/time';

const keyOf = (entry: JournalEntry) => `${entry.period}-${entry.id}`;

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

  const entries: EventLogEntry[] = state.events
    .toReversed()
    .map((entry, index) => ({
      id: keyOf(entry),
      date: formatDate(dateOf({ ...state, period: entry.period })),
      text: entry.text,
      isNew: index < fresh,
    }));

  return { entries };
};
