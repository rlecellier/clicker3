import { Progress } from '@base-ui/react/progress';
import styles from './ProgressBar.module.css';

type ProgressBarProperties = {
  label: string;
  value: number;
  max: number;
};

export const ProgressBar = ({ label, value, max }: ProgressBarProperties) => (
  <Progress.Root className={styles.root} value={value} max={max}>
    <Progress.Label className={styles.label}>{label}</Progress.Label>
    <Progress.Track className={styles.track}>
      <Progress.Indicator className={styles.indicator} />
    </Progress.Track>
  </Progress.Root>
);
