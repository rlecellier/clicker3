import type { ReactNode } from 'react';
import styles from './Stat.module.css';

type StatProperties = { label: string; value: ReactNode };

export const Stat = ({ label, value }: StatProperties) => (
  <div className={styles.stat}>
    <dt className={styles.label}>{label}</dt>
    <dd className={styles.value}>{value}</dd>
  </div>
);
