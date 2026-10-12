import type { ReactNode } from 'react';
import { Balance } from '@component/Balance';
import styles from './Stat.module.css';

type StatProperties = {
  label: string;
  value: ReactNode;
  // Valeur exacte, quand `value` est abrégé : infobulle au survol.
  exact?: string;
  // Variation de la période en cours, déjà signée (« +120 € »).
  balance?: string;
};

export const Stat = ({ label, value, exact, balance }: StatProperties) => (
  <div
    className={`${styles.stat} ${balance === undefined ? '' : styles.withBalance}`}
  >
    <dt className={styles.label}>{label}</dt>
    <dd className={styles.value} title={exact}>
      {value}
    </dd>
    {balance !== undefined && (
      <Balance balance={balance} className={styles.balance} />
    )}
  </div>
);
