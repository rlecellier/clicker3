import type { CSSProperties, ReactNode } from 'react';
import styles from './Note.module.css';

type NoteProperties = {
  children: ReactNode;
  // Nombre de lignes réservées : le post-it garde sa hauteur quand le texte
  // change.
  minLines?: number;
};

export const Note = ({ children, minLines }: NoteProperties) => (
  <aside
    className={styles.note}
    style={{ '--note-lines': minLines } as CSSProperties}
  >
    {children}
  </aside>
);
