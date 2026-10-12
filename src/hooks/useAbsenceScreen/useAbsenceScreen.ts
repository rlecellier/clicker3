import type { EventLogEntry } from '@component/EventLog';
import type { FigureItem } from '@component/FigureList';
import { useGameContext } from '@context/GameContext';
import { formatCount, formatDecimal, formatMoney } from '@game/format';
import { journalEntry } from '@view/journal';

// Une longue absence peut semer des centaines de lettres : on garde les plus
// récentes.
const MAX_EVENTS = 12;

const signed = (value: number, format: (amount: number) => string) =>
  value > 0 ? `+${format(value)}` : format(value);

const plural = (count: number, one: string, many: string) =>
  `${formatCount(count)} ${count > 1 ? many : one}`;

// « Pendant votre absence » : le résumé du rattrapage, prêt à afficher.
export const useAbsenceScreen = () => {
  const { state, absence, dismissAbsence } = useGameContext();

  if (absence === null) {
    return null;
  }

  const periods = plural(absence.periods, 'période', 'périodes');
  const years = absence.ageAfter - absence.ageBefore;
  const elapsed =
    years > 0 ? `${periods} (${plural(years, 'an', 'ans')})` : periods;

  const figures: FigureItem[] = [
    { label: 'Temps écoulé', value: elapsed },
    { label: 'Argent', value: signed(absence.money, formatMoney) },
    { label: 'Stock', value: signed(absence.stock, formatCount) },
    { label: 'Réputation', value: signed(absence.reputation, formatDecimal) },
  ];

  // Du plus récent au plus ancien, comme le courrier.
  const events: EventLogEntry[] = absence.events
    .toReversed()
    .slice(0, MAX_EVENTS)
    .map((entry) => journalEntry(state, entry));

  return { figures, events, hasDied: absence.died, dismiss: dismissAbsence };
};
