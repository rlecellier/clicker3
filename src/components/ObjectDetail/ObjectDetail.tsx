import styles from './ObjectDetail.module.css';

type ObjectDetailProperties = {
  icon: string;
  name: string;
  description: string;
  // Ce que l'objet débloque : des listes titrées (activités, événements).
  unlocks: readonly { caption: string; items: readonly string[] }[];
};

// Description de l'objet choisi dans l'inventaire : ce que c'est, ce qu'il fait.
export const ObjectDetail = ({
  icon,
  name,
  description,
  unlocks,
}: ObjectDetailProperties) => (
  <article className={styles.detail} aria-label={name}>
    <h3 className={styles.title}>
      <span aria-hidden="true">{icon}</span> {name}
    </h3>
    <p className={styles.description}>{description}</p>
    {unlocks.map(({ caption, items }) => (
      <p key={caption} className={styles.unlock}>
        <strong>{caption}</strong> : {items.join(', ')}.
      </p>
    ))}
  </article>
);
