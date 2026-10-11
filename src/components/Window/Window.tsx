import type { ReactNode } from 'react';
import styles from './Window.module.css';

type WindowProperties = {
  title: string;
  children: ReactNode;
  // Boutons ou état affichés à droite de la barre de titre.
  actions?: ReactNode;
};

export const Window = ({ title, children, actions }: WindowProperties) => (
  <section className={styles.window} aria-label={title}>
    <header className={styles.titleBar}>
      <h2 className={styles.title}>{title}</h2>
      {actions}
    </header>
    <div className={styles.content}>{children}</div>
  </section>
);
