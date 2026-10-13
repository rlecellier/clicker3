import { Badge } from '@component/Badge';
import styles from './MarkerTrack.module.css';

type MarkerTrackProperties = {
  count: number;
  max: number;
  isSleeping: boolean;
};

// Le cerveau et ses marqueurs (x/max). Au sommeil, il se vide marqueur par
// marqueur.
export const MarkerTrack = ({
  count,
  max,
  isSleeping,
}: MarkerTrackProperties) => (
  <div className={styles.track}>
    <span>
      Cerveau {count}/{max}
    </span>
    <span className={styles.slots} aria-hidden="true">
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={index < count ? styles.full : styles.empty}
        />
      ))}
    </span>
    {isSleeping ? <Badge tone="alert">Zzz</Badge> : null}
  </div>
);
