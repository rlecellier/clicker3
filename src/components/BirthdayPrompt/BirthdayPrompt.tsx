import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@component/Button';
import { FigureList } from '@component/FigureList';
import type { FigureItem } from '@component/FigureList';
import styles from './BirthdayPrompt.module.css';

type BirthdayPromptProperties = {
  title: string;
  message: string;
  // Bilan depuis l'anniversaire précédent, vide au départ.
  figures: readonly FigureItem[];
  buttonLabel: string;
  onClose: () => void;
};

// Fenêtre modale qui arrête le jeu jusqu'à sa fermeture (ni Échap ni clic à
// côté ne la ferme).
export const BirthdayPrompt = ({
  title,
  message,
  figures,
  buttonLabel,
  onClose,
}: BirthdayPromptProperties) => (
  <AlertDialog.Root open>
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className={styles.backdrop} />
      <AlertDialog.Popup className={styles.popup}>
        <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
        <div className={styles.content}>
          <AlertDialog.Description className={styles.message}>
            {message}
          </AlertDialog.Description>
          {figures.length > 0 && <FigureList figures={figures} />}
          <div className={styles.buttons}>
            <Button variant="primary" onClick={onClose}>
              {buttonLabel}
            </Button>
          </div>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
