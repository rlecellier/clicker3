import { ResourceIcon } from '@component/ResourceIcon';
import styles from './ResourceBar.module.css';

type ResourceBarProperties = {
  money: { value: string; exact: string };
  stock: { value: string; exact: string };
  reputation: {
    // Étoiles pleines, sur `max` ; texte lu à la place des étoiles.
    tier: number;
    max: number;
    label: string;
  };
};

// Les ressources du joueur sur une ligne : argent, stock et paliers de
// réputation, chacun avec son icône. Le libellé reste dans le DOM pour les
// lecteurs d'écran et les tests, masqué visuellement sauf pour la réputation.
export const ResourceBar = ({
  money,
  stock,
  reputation,
}: ResourceBarProperties) => (
  <dl className={styles.bar} aria-label="Ressources">
    <div className={styles.item}>
      <dt className={styles.hidden}>Argent</dt>
      <ResourceIcon id="money" />
      <dd className={styles.value} title={money.exact}>
        {money.value}
      </dd>
    </div>
    <div className={styles.item}>
      <dt className={styles.hidden}>Stock</dt>
      <ResourceIcon id="stock" />
      <dd className={styles.value} title={stock.exact}>
        {stock.value}
      </dd>
    </div>
    <div className={styles.item}>
      <dt className={styles.name}>Réputation</dt>
      <dd
        className={styles.stars}
        role="img"
        aria-label={reputation.label}
        title={reputation.label}
      >
        {Array.from({ length: reputation.max }, (_, index) => (
          <ResourceIcon
            key={index}
            id={index < reputation.tier ? 'star' : 'star-empty'}
          />
        ))}
      </dd>
    </div>
  </dl>
);
