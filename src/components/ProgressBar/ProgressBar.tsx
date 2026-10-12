import type { ReactNode } from 'react';
import { Progress } from '@base-ui/react/progress';
import styles from './ProgressBar.module.css';

type ProgressBarProperties = {
  label: string;
  value: number;
  max: number;
  // `small` : version mini, piste basse et libellé court (sous un bouton).
  size?: 'normal' | 'small';
  // Élément à droite du libellé, sur la même ligne.
  aside?: ReactNode;
  // Remplissage par nature, dans l'ordre : chaque part prend sa couleur. Sans
  // `segments`, la barre est d'une seule couleur (bleu).
  segments?: { tone: 'study' | 'work' | 'sleep'; value: number }[];
};

export const ProgressBar = ({
  label,
  value,
  max,
  size = 'normal',
  aside,
  segments,
}: ProgressBarProperties) => (
  <Progress.Root
    className={`${styles.root} ${size === 'small' ? styles.small : ''}`}
    value={value}
    max={max}
  >
    <div className={styles.head}>
      <Progress.Label className={styles.label} title={label}>
        {label}
      </Progress.Label>
      {aside}
    </div>
    <Progress.Track className={styles.track}>
      {segments === undefined ? (
        <Progress.Indicator className={styles.indicator} />
      ) : (
        <div className={styles.segments}>
          {segments.map(({ tone, value: part }, index) => (
            <div
              key={index}
              className={`${styles.indicator} ${styles[tone]}`}
              style={{ width: `${(part / max) * 100}%` }}
            />
          ))}
        </div>
      )}
    </Progress.Track>
  </Progress.Root>
);
