import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@component/Button';
import styles from './PromotionPrompt.module.css';

type PromotionPromptProperties = {
  title: string;
  // Le mot de la direction.
  message: string;
  // Ce que l'acceptation change, déjà formaté (« Salaire par action : … »).
  detail: string;
  acceptLabel: string;
  refuseLabel: string;
  onAccept: () => void;
  onRefuse: () => void;
};

// Fenêtre modale qui arrête le jeu : une réponse est obligatoire (ni Échap ni
// clic à côté ne la ferme).
export const PromotionPrompt = ({
  title,
  message,
  detail,
  acceptLabel,
  refuseLabel,
  onAccept,
  onRefuse,
}: PromotionPromptProperties) => (
  <AlertDialog.Root open>
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className={styles.backdrop} />
      <AlertDialog.Popup className={styles.popup}>
        <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
        <div className={styles.content}>
          <AlertDialog.Description className={styles.message}>
            {message}
          </AlertDialog.Description>
          <p className={styles.detail}>{detail}</p>
          <div className={styles.buttons}>
            <Button variant="primary" onClick={onAccept}>
              {acceptLabel}
            </Button>
            <Button onClick={onRefuse}>{refuseLabel}</Button>
          </div>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
