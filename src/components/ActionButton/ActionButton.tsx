import { Button } from '@component/Button';
import styles from './ActionButton.module.css';

type ActionButtonProperties = {
  label: string;
  // Coût ou effet attendu, affiché sous le libellé.
  detail?: string;
  // Raison lisible quand l'action est impossible.
  reason?: string;
  isDisabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  onClick: () => void;
};

export const ActionButton = ({
  label,
  detail,
  reason,
  isDisabled = false,
  variant,
  onClick,
}: ActionButtonProperties) => (
  <div className={styles.action}>
    <Button
      variant={variant}
      size="large"
      isDisabled={isDisabled}
      onClick={onClick}
    >
      {label}
    </Button>
    {isDisabled && reason !== undefined ? (
      <p className={styles.reason}>{reason}</p>
    ) : (
      detail !== undefined && <p className={styles.detail}>{detail}</p>
    )}
  </div>
);
