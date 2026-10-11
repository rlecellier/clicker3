import { Stat } from '@component/Stat';
import styles from './FigureList.module.css';

export type FigureItem = { label: string; value: string };

type FigureListProperties = { figures: readonly FigureItem[] };

// Chiffres d'un bilan, en grille de `Stat`.
export const FigureList = ({ figures }: FigureListProperties) => (
  <dl className={styles.list}>
    {figures.map((figure) => (
      <Stat key={figure.label} label={figure.label} value={figure.value} />
    ))}
  </dl>
);
