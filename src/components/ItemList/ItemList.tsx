import { Button } from '@component/Button';
import { WithBadge } from '@component/WithBadge';
import { itemElementId } from './itemElementId';
import styles from './ItemList.module.css';

export type ListCondition = { label: string; isMet: boolean };

export type ListAction = {
  id: string;
  label: string;
  isDisabled: boolean;
  onAction: () => void;
};

export type ListItem = {
  id: string;
  title: string;
  detail?: string;
  // Effet chiffré, une ligne par élément, mis en avant avant le détail.
  effects?: readonly string[];
  // Repère affiché à côté du titre (ex. « Actuel »).
  badge?: string;
  actionLabel: string;
  isDisabled: boolean;
  reason?: string;
  // Prérequis, chacun en vert (obtenu) ou en rouge (manquant).
  conditions?: readonly ListCondition[];
  onAction: () => void;
  // Autres gestes sur la même ligne (ex. retirer, placer la moitié).
  extraActions?: readonly ListAction[];
};

// Ligne purement informative : mêmes champs, sans bouton.
export type InfoListItem = Omit<
  ListItem,
  'actionLabel' | 'isDisabled' | 'reason' | 'onAction' | 'extraActions'
>;

type ItemListProperties = {
  caption: string;
  items: readonly (ListItem | InfoListItem)[];
  // Ligne mise en évidence (ex. cible d'un lien).
  highlightedId?: string;
};

export const ItemList = ({
  caption,
  items,
  highlightedId,
}: ItemListProperties) => (
  <section aria-label={caption}>
    <h3 className={styles.caption}>{caption}</h3>
    <ul className={styles.list}>
      {items.map((item) => (
        <li
          key={item.id}
          id={itemElementId(item.id)}
          className={`${styles.item} ${item.id === highlightedId ? styles.highlighted : ''}`}
        >
          <div className={styles.text}>
            <span className={styles.title}>
              <WithBadge badge={item.badge}>{item.title}</WithBadge>
            </span>
            {item.effects === undefined || item.effects.length === 0 ? null : (
              <ul className={styles.effects}>
                {item.effects.map((effect) => (
                  <li key={effect}>{effect}</li>
                ))}
              </ul>
            )}
            {item.detail === undefined ? null : (
              <span className={styles.detail}>{item.detail}</span>
            )}
            {item.conditions === undefined ||
            item.conditions.length === 0 ? null : (
              <ul className={styles.conditions}>
                {item.conditions.map((condition) => (
                  <li
                    key={condition.label}
                    className={condition.isMet ? styles.met : styles.missing}
                  >
                    {condition.isMet ? '✔' : '✘'} {condition.label}
                  </li>
                ))}
              </ul>
            )}
            {'actionLabel' in item &&
            item.isDisabled &&
            item.reason !== undefined ? (
              <span className={styles.reason}>{item.reason}</span>
            ) : null}
          </div>
          {'actionLabel' in item ? (
            <div className={styles.actions}>
              <Button isDisabled={item.isDisabled} onClick={item.onAction}>
                {item.actionLabel}
              </Button>
              {item.extraActions?.map((action) => (
                <Button
                  key={action.id}
                  isDisabled={action.isDisabled}
                  onClick={action.onAction}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  </section>
);
