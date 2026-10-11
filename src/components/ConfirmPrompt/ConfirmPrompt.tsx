import { Button } from '@component/Button';
import { Note } from '@component/Note';
import styles from './ConfirmPrompt.module.css';

type ConfirmPromptProperties = {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Demande de confirmation en ligne, avant un geste qui détruit la partie.
export const ConfirmPrompt = ({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmPromptProperties) => (
  <div role="alertdialog" aria-label={message} className={styles.prompt}>
    <Note>{message}</Note>
    <div className={styles.buttons}>
      <Button variant="danger" onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button onClick={onCancel}>{cancelLabel}</Button>
    </div>
  </div>
);
