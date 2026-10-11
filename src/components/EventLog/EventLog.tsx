import { Badge } from '@component/Badge';
import styles from './EventLog.module.css';

export type EventLogEntry = {
  id: string;
  // Date déjà formatée (« mars 2000 »).
  date: string;
  // Texte affiché tel quel.
  text: string;
  // Message de la période en cours : mis en évidence.
  isNew: boolean;
};

type EventLogProperties = {
  // Du plus récent au plus ancien.
  entries: readonly EventLogEntry[];
  emptyText: string;
};

export const EventLog = ({ entries, emptyText }: EventLogProperties) =>
  entries.length === 0 ? (
    <p className={styles.empty}>{emptyText}</p>
  ) : (
    <ol className={styles.list} aria-label="Courrier">
      {entries.map((entry) => (
        <li key={entry.id} className={entry.isNew ? styles.fresh : styles.item}>
          <p className={styles.header}>
            <time>{entry.date}</time>
            {entry.isNew ? <Badge tone="alert">Nouveau</Badge> : null}
          </p>
          <p className={styles.text}>{entry.text}</p>
        </li>
      ))}
    </ol>
  );
