import { Menu } from '@base-ui/react/menu';
import { Button } from '@component/Button';
import styles from './SplitActionButton.module.css';

export type SplitChoice = {
  id: string;
  label: string;
  detail?: string;
};

type SplitActionButtonProperties = {
  label: string;
  // Coût ou effet attendu, affiché sous le bouton.
  detail?: string;
  // Raison lisible quand l'action est impossible.
  reason?: string;
  isDisabled?: boolean;
  // Nom accessible de la flèche (« Choisir le cursus »).
  menuLabel: string;
  choices: readonly SplitChoice[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClick: () => void;
};

// Bouton d'action en deux parties : le geste à gauche, la flèche à droite
// pour choisir ce que le geste vise. Le choix reste mémorisé.
export const SplitActionButton = ({
  label,
  detail,
  reason,
  isDisabled = false,
  menuLabel,
  choices,
  selectedId,
  onSelect,
  onClick,
}: SplitActionButtonProperties) => (
  <div className={styles.action}>
    <div className={styles.split}>
      <div className={styles.main}>
        <Button size="large" isDisabled={isDisabled} onClick={onClick}>
          {label}
        </Button>
      </div>
      <Menu.Root>
        <Menu.Trigger className={styles.arrow} aria-label={menuLabel}>
          <span aria-hidden="true">▼</span>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align="end" sideOffset={2}>
            <Menu.Popup className={styles.popup}>
              <Menu.RadioGroup value={selectedId} onValueChange={onSelect}>
                {choices.map((choice) => (
                  <Menu.RadioItem
                    key={choice.id}
                    value={choice.id}
                    closeOnClick
                    className={styles.choice}
                  >
                    <span className={styles.choiceLabel}>{choice.label}</span>
                    {choice.detail === undefined ? null : (
                      <span className={styles.choiceDetail}>
                        {choice.detail}
                      </span>
                    )}
                  </Menu.RadioItem>
                ))}
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
    {isDisabled && reason !== undefined ? (
      <p className={styles.reason}>{reason}</p>
    ) : (
      detail !== undefined && <p className={styles.detail}>{detail}</p>
    )}
  </div>
);
