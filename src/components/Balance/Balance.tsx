import styles from './Balance.module.css';

type BalanceProperties = {
  // Variation de la période en cours, déjà signée (« +120 € », « −45 »).
  balance: string;
  // Taille et placement, fixés par le composant qui l'affiche.
  className?: string;
};

const toneOf = (balance: string) => {
  if (balance.startsWith('+')) {
    return styles.positive;
  }
  return balance.startsWith('−') ? styles.negative : '';
};

// Balance de la période (dans un `<dl>`) : verte en hausse, rouge en baisse.
export const Balance = ({ balance, className = '' }: BalanceProperties) => (
  <dd className={`${className} ${toneOf(balance)}`} title="Période en cours">
    {balance}
  </dd>
);
