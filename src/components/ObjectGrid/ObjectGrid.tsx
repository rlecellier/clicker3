import styles from './ObjectGrid.module.css';

export type ObjectTile = { id: string; name: string; icon: string };

type ObjectGridProperties = {
  label: string;
  items: readonly ObjectTile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// Grille de tous les objets de l'inventaire : un tap en choisit un.
export const ObjectGrid = ({
  label,
  items,
  selectedId,
  onSelect,
}: ObjectGridProperties) => (
  <ul className={styles.grid} aria-label={label}>
    {items.map((item) => (
      <li key={item.id}>
        <button
          type="button"
          className={styles.tile}
          aria-pressed={item.id === selectedId}
          onClick={() => {
            onSelect(item.id);
          }}
        >
          <span className={styles.icon} aria-hidden="true">
            {item.icon}
          </span>
          <span className={styles.name}>{item.name}</span>
        </button>
      </li>
    ))}
  </ul>
);
