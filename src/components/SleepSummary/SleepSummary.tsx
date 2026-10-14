import styles from './SleepSummary.module.css';

type SleepSummaryProperties = {
  // Titre : le rythme de la journée (« Sommeil : 8 h par jour »).
  title: string;
  // Détails dessous, une ligne chacun (base de l'âge, bonus, dernière nuit).
  lines: string[];
};

// Le sommeil du personnage, à lire : pas de réglage, il ne change que par les
// améliorations.
export const SleepSummary = ({ title, lines }: SleepSummaryProperties) => (
  <section className={styles.summary} aria-label="Sommeil">
    <p className={styles.title}>{title}</p>
    {lines.map((line) => (
      <p key={line} className={styles.line}>
        {line}
      </p>
    ))}
  </section>
);
