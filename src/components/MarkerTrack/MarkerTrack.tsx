import styles from './MarkerTrack.module.css';

type MarkerTrackProperties = {
  count: number;
  max: number;
};

// Le cerveau et ses marqueurs (x/max). La nuit, il se vide d'un coup.
export const MarkerTrack = ({ count, max }: MarkerTrackProperties) => (
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
  </div>
);
