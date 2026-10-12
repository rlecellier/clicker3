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
};

export const ProgressBar = ({
  label,
  value,
  max,
  size = 'normal',
  aside,
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
      <Progress.Indicator className={styles.indicator} />
    </Progress.Track>
  </Progress.Root>
);
