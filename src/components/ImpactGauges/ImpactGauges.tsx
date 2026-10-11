import { ProgressBar } from '@component/ProgressBar';
import styles from './ImpactGauges.module.css';

export type Gauge = { id: string; label: string; value: number };

type ImpactGaugesProperties = {
  caption: string;
  gauges: readonly Gauge[];
};

// Jauges de 0 à 100, en lecture seule.
export const ImpactGauges = ({ caption, gauges }: ImpactGaugesProperties) => (
  <section className={styles.gauges} aria-label={caption}>
    <h3 className={styles.caption}>{caption}</h3>
    {gauges.map((gauge) => (
      <ProgressBar
        key={gauge.id}
        label={`${gauge.label} : ${gauge.value} / 100`}
        value={gauge.value}
        max={100}
      />
    ))}
  </section>
);
