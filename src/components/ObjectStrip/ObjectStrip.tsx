import { Link } from 'react-router';
import styles from './ObjectStrip.module.css';

export type ObjectIcon = { id: string; name: string; icon: string };

type ObjectStripProperties = {
  label: string;
  items: readonly ObjectIcon[];
  // Dernière icône, « + » : mène à l'inventaire.
  more: { to: string; label: string };
};

// Bande d'icônes des objets récupérés, sur une ligne (elle défile si elle
// déborde), terminée par un « + » qui ouvre l'inventaire.
export const ObjectStrip = ({ label, items, more }: ObjectStripProperties) => (
  <ul className={styles.strip} aria-label={label}>
    {items.map((item) => (
      <li key={item.id} className={styles.item} title={item.name}>
        <span aria-hidden="true">{item.icon}</span>
        <span className={styles.name}>{item.name}</span>
      </li>
    ))}
    <li className={styles.more}>
      <Link
        className={styles.link}
        to={more.to}
        aria-label={more.label}
        title={more.label}
      >
        <span aria-hidden="true">+</span>
      </Link>
    </li>
  </ul>
);
