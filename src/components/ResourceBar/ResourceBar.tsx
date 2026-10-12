import { ResourceIcon } from '@component/ResourceIcon';
import styles from './ResourceBar.module.css';

type ResourceBarProperties = {
  money: { value: string; exact: string };
  stock: { value: string; exact: string };
};

// Les ressources du joueur sur une ligne : argent et stock, chacun avec son
// icône. Le libellé reste dans le DOM pour les lecteurs d'écran et les tests,
// masqué visuellement.
export const ResourceBar = ({ money, stock }: ResourceBarProperties) => (
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
  </dl>
);
