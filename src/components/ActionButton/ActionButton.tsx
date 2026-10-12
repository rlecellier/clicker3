import { Badge } from '@component/Badge';
import { Button } from '@component/Button';
import styles from './ActionButton.module.css';

// Gestes d'un appui maintenu, à poser sur le conteneur du bouton (fournis par
// le hook `useHoldRepeat`).
export type PressHandlers = {
  onPointerDown: (event?: { button?: number }) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onKeyDown: (event: {
    key: string;
    repeat: boolean;
    preventDefault: () => void;
  }) => void;
  onContextMenu: (event: { preventDefault: () => void }) => void;
};

type ActionButtonProperties = {
  label: string;
  // Coût ou effet attendu, affiché sous le libellé.
  detail?: string;
  // Raison lisible quand l'action est impossible.
  reason?: string;
  isDisabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  // Action automatique de ce bouton : l'appui long l'active ou la coupe.
  isAuto?: boolean;
  autoHint?: string;
  // Appui maintenu : répétition de l'action (et appui long).
  press?: PressHandlers;
  // Touche du raccourci clavier.
  shortcut?: string;
  onClick: () => void;
};

export const ActionButton = ({
  label,
  detail,
  reason,
  isDisabled = false,
  variant,
  isAuto = false,
  autoHint,
  press,
  shortcut,
  onClick,
}: ActionButtonProperties) => (
  <div className={styles.action} {...press}>
    <Button
      variant={variant}
      size="large"
      isDisabled={isDisabled}
      shortcut={shortcut}
      onClick={onClick}
    >
      {label}
    </Button>
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
    {autoHint === undefined ? null : (
      <p className={styles.detail}>
        {isAuto ? <Badge tone="info">Auto</Badge> : null} {autoHint}
      </p>
    )}
  </div>
);
