import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import styles from './GameHeader.module.css';

type GameHeaderProperties = {
  money: string;
  // Montant exact, en infobulle.
  exactMoney: string;
  // Variation d'argent de la période en cours, signée.
  balance: string;
  date: string;
  gauge: { value: number; max: number };
};

// En-tête fixe de l'écran de jeu : l'argent et la date, dont la barre se
// remplit au fil de la période, sur une seule ligne et à hauteur constante.
export const GameHeader = ({
  money,
  exactMoney,
  balance,
  date,
  gauge,
}: GameHeaderProperties) => (
  <header className={styles.header}>
    <dl className={styles.money}>
      <Stat label="Argent" value={money} exact={exactMoney} balance={balance} />
    </dl>
    <ProgressBar label={date} value={gauge.value} max={gauge.max} />
  </header>
);
