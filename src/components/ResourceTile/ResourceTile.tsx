import { ResourceIcon } from '@component/ResourceIcon';
import type { ResourceIconId } from '@component/ResourceIcon';
import styles from './ResourceTile.module.css';

type ResourceTileProperties = {
  icon: ResourceIconId;
  label: string;
  // Variation de la période en cours, déjà signée (« +120 € »).
  balance: string;
};

const toneOf = (balance: string) => {
  if (balance.startsWith('+')) {
    return styles.positive;
  }
  return balance.startsWith('−') ? styles.negative : '';
};

// Tuile carrée : icône, nom de la ressource et balance de la période. À placer
// dans une grille, deux tuiles côte à côte de même taille.
export const ResourceTile = ({
  icon,
  label,
  balance,
}: ResourceTileProperties) => (
  <div className={styles.tile}>
    <ResourceIcon id={icon} />
    <dt className={styles.label}>{label}</dt>
    <dd
      className={`${styles.balance} ${toneOf(balance)}`}
      title="Période en cours"
    >
      {balance}
    </dd>
  </div>
);
