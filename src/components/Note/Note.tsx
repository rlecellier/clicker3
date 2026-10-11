import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './Note.module.css';

type NoteProperties = {
  children: ReactNode;
  // Nombre de lignes réservées : le post-it garde sa hauteur quand le texte
  // change.
  minLines?: number;
  // Destination : tout le post-it devient un lien.
  to?: string;
};

export const Note = ({ children, minLines, to }: NoteProperties) => (
  <aside
    className={styles.note}
    style={{ '--note-lines': minLines } as CSSProperties}
  >
    {to === undefined ? (
      children
    ) : (
      <Link className={styles.link} to={to}>
        {children}
      </Link>
    )}
  </aside>
);
