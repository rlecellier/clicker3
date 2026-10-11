import { Badge } from '@component/Badge';
import { Button } from '@component/Button';
import styles from './ItemList.module.css';

export type ListItem = {
  id: string;
  title: string;
  detail?: string;
  // Repère affiché à côté du titre (ex. « Actuel »).
  badge?: string;
  actionLabel: string;
  isDisabled: boolean;
  reason?: string;
  onAction: () => void;
};

type ItemListProperties = { caption: string; items: readonly ListItem[] };

export const ItemList = ({ caption, items }: ItemListProperties) => (
  <section aria-label={caption}>
    <h3 className={styles.caption}>{caption}</h3>
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <div className={styles.text}>
            <span className={styles.title}>
              {item.title}
              {item.badge === undefined ? null : (
                <>
                  {' '}
                  <Badge tone="info">{item.badge}</Badge>
                </>
              )}
            </span>
            {item.detail === undefined ? null : (
              <span className={styles.detail}>{item.detail}</span>
            )}
            {item.isDisabled && item.reason !== undefined ? (
              <span className={styles.reason}>{item.reason}</span>
            ) : null}
          </div>
          <Button isDisabled={item.isDisabled} onClick={item.onAction}>
            {item.actionLabel}
          </Button>
        </li>
      ))}
    </ul>
  </section>
);
