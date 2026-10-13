import { Link } from 'react-router';
import { Balance } from '@component/Balance';
import { ResourceIcon } from '@component/ResourceIcon';
import type { ResourceIconId } from '@component/ResourceIcon';
import styles from './ResourceTile.module.css';

type ResourceTileProperties = {
  icon: ResourceIconId;
  label: string;
  // Variation de la période en cours, déjà signée (« +120 € »).
  balance: string;
  // Récap de la période pour cette ressource : toute la tuile y mène.
  to: string;
};

// Tuile sur une ligne : icône, nom de la ressource et balance de la période. À
// placer dans une grille, deux tuiles côte à côte de même taille.
export const ResourceTile = ({
  icon,
  label,
  balance,
  to,
}: ResourceTileProperties) => (
  <div className={styles.tile}>
    <ResourceIcon id={icon} />
    <dt className={styles.label}>
      <Link className={styles.link} to={to}>
        {label}
      </Link>
    </dt>
    <Balance balance={balance} className={styles.balance} />
  </div>
);
