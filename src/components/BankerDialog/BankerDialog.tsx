import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@component/Button';
import styles from './BankerDialog.module.css';

type BankerDialogProperties = {
  title: string;
  // Ce que dit le banquier.
  message: string;
  // Les réponses possibles du joueur.
  replies: readonly string[];
  leaveLabel: string;
  onReply: () => void;
  onLeave: () => void;
};

// Petite scène de dialogue : le banquier parle, le joueur répond. Une réponse
// ou un départ est obligatoire (ni Échap ni clic à côté ne la ferme).
export const BankerDialog = ({
  title,
  message,
  replies,
  leaveLabel,
  onReply,
  onLeave,
}: BankerDialogProperties) => (
  <AlertDialog.Root open>
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className={styles.backdrop} />
      <AlertDialog.Popup className={styles.popup}>
        <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
        <div className={styles.content}>
          <AlertDialog.Description className={styles.message}>
            {message}
          </AlertDialog.Description>
          <div className={styles.buttons}>
            {replies.map((reply, index) => (
              <Button
                key={reply}
                variant={index === 0 ? 'primary' : undefined}
                onClick={onReply}
              >
                {reply}
              </Button>
            ))}
            <Button onClick={onLeave}>{leaveLabel}</Button>
          </div>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
