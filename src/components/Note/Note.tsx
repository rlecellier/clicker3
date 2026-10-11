import type { ReactNode } from 'react';
import styles from './Note.module.css';

type NoteProperties = { children: ReactNode };

export const Note = ({ children }: NoteProperties) => (
  <aside className={styles.note}>{children}</aside>
);
