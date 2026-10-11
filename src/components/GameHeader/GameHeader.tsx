import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import styles from './GameHeader.module.css';

type GameHeaderProperties = {
  money: string;
  gauge: { value: number; max: number };
};

// En-tête fixe de l'écran de jeu : l'argent et la jauge de temps, sur une
// seule ligne et à hauteur constante.
export const GameHeader = ({ money, gauge }: GameHeaderProperties) => (
  <header className={styles.header}>
    <dl className={styles.money}>
      <Stat label="Argent" value={money} />
    </dl>
    <ProgressBar label="Jauge de temps" value={gauge.value} max={gauge.max} />
  </header>
);
