import type { EventLogEntry } from '@component/EventLog';
import { formatPeriodDate } from '@game/format';
import type { GameState, JournalEntry } from '@game/state';

// Une lettre du journal, prête pour `EventLog` (courrier, absence). Un
// événement ne survient qu'une fois par période : période et id font la clé.
export const journalEntry = (
  state: GameState,
  entry: JournalEntry,
  isNew = false,
): EventLogEntry => ({
  id: `${entry.period}-${entry.id}`,
  date: formatPeriodDate(state, entry.period),
  text: entry.text,
  isNew,
});
