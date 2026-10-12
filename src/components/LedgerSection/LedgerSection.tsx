import type { ReactNode } from 'react';
import styles from './LedgerSection.module.css';

type LedgerSectionProperties = {
  title: string;
  // Une phrase qui explique la mécanique, visible sans toucher.
  help: string;
  children: ReactNode;
};

export const LedgerSection = ({
  title,
  help,
  children,
}: LedgerSectionProperties) => (
  <section className={styles.section} aria-label={title}>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.help}>{help}</p>
    {children}
  </section>
);
