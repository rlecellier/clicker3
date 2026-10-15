import styles from './PolarGauge.module.css';

type PolarGaugeProperties = {
  // Nom de l'axe, au centre au-dessus de la piste.
  name: string;
  // Nom accessible complet (« Énergie : Vif »).
  label: string;
  // Pôle de gauche (valeurs négatives) et pôle de droite (valeurs positives).
  negativePole: string;
  positivePole: string;
  // De −`max` à +`max` ; 0 au milieu.
  value: number;
  max: number;
  // Distances à 0 où poser un repère (les paliers qui débloquent).
  marks?: readonly number[];
};

// Position d'une valeur sur la piste, de 0 % (−max) à 100 % (+max).
const place = (value: number, max: number) => 50 + (value / max) * 50;

// Axe à deux pôles : le curseur part du milieu et glisse d'un côté ou de
// l'autre, sans « mauvais » côté (les deux pôles pèsent autant).
export const PolarGauge = ({
  name,
  label,
  negativePole,
  positivePole,
  value,
  max,
  marks = [],
}: PolarGaugeProperties) => {
  const position = place(value, max);
  const fillStart = Math.min(position, 50);
  const fillSpan = Math.abs(position - 50);
  return (
    <div
      className={styles.root}
      role="meter"
      aria-label={label}
      aria-valuemin={-max}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className={styles.head} aria-hidden="true">
        <span className={value < 0 ? styles.active : styles.pole}>
          {negativePole}
        </span>
        <span className={styles.name}>{name}</span>
        <span
          className={value > 0 ? styles.active : styles.pole}
          data-side="end"
        >
          {positivePole}
        </span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <div
          className={styles.fill}
          style={{ left: `${fillStart}%`, width: `${fillSpan}%` }}
        />
        <div className={styles.center} />
        {marks.flatMap((mark) => [
          <div
            key={`-${mark}`}
            className={styles.mark}
            style={{ left: `${place(-mark, max)}%` }}
          />,
          <div
            key={`+${mark}`}
            className={styles.mark}
            style={{ left: `${place(mark, max)}%` }}
          />,
        ])}
        <div className={styles.thumb} style={{ left: `${position}%` }} />
      </div>
    </div>
  );
};
