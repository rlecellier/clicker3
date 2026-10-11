import { Badge } from '@component/Badge';
import styles from './MarkerTrack.module.css';

type MarkerTrackProperties = { count: number; max: number };

// Marqueurs détenus (x/max). Plein : les suivants sont perdus, il faut dormir.
export const MarkerTrack = ({ count, max }: MarkerTrackProperties) => (
  <div className={styles.track}>
    <span>
      Marqueurs {count}/{max}
    </span>
    <span className={styles.slots} aria-hidden="true">
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={index < count ? styles.full : styles.empty}
        />
      ))}
    </span>
    {count >= max ? <Badge tone="alert">Dormir !</Badge> : null}
  </div>
);
