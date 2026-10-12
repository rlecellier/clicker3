import type { ReactNode } from 'react';
import styles from './ScreenPage.module.css';

type ScreenPageProperties = { children: ReactNode };

// Écran hors jeu (titre, nouvelle vie, absence, fin) : une colonne centrée,
// sans sidebar ni en-tête.
export const ScreenPage = ({ children }: ScreenPageProperties) => (
  <main className={styles.page}>{children}</main>
);
