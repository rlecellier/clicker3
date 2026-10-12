import { Menu } from '@base-ui/react/menu';
import type { PressHandlers } from '@component/ActionButton';
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
  // Appui maintenu sur le geste : répétition de l'action.
  press?: PressHandlers;
  // Touche du raccourci clavier.
  shortcut?: string;
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
  press,
  shortcut,
  onClick,
}: SplitActionButtonProperties) => (
  <div className={styles.action}>
    <div className={styles.split}>
      <div className={styles.main} {...press}>
        <Button
          size="large"
          isDisabled={isDisabled}
          shortcut={shortcut}
          onClick={onClick}
        >
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
    <div className={styles.info}>
      {isDisabled && reason !== undefined ? (
        <p className={styles.reason} title={reason}>
          {reason}
        </p>
      ) : (
        detail !== undefined && (
          <p className={styles.detail} title={detail}>
            {detail}
          </p>
        )
      )}
    </div>
  </div>
);
