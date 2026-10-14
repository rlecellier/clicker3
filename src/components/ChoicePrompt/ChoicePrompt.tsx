import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@component/Button';
import styles from './ChoicePrompt.module.css';

export type PromptChoice = {
  label: string;
  // Ce que le choix change, déjà formaté (« Énergie → Vif · Trait : Têtu »).
  effects: string;
  onChoose: () => void;
};

type ChoicePromptProperties = {
  title: string;
  message: string;
  choices: readonly PromptChoice[];
};

// Fenêtre modale qui arrête le jeu : une réponse est obligatoire (ni Échap ni
// clic à côté ne la ferme). Chaque choix montre ce qu'il rapporte.
export const ChoicePrompt = ({
  title,
  message,
  choices,
}: ChoicePromptProperties) => (
  <AlertDialog.Root open>
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className={styles.backdrop} />
      <AlertDialog.Popup className={styles.popup}>
        <AlertDialog.Title className={styles.title}>{title}</AlertDialog.Title>
        <div className={styles.content}>
          <AlertDialog.Description className={styles.message}>
            {message}
          </AlertDialog.Description>
          <ul className={styles.choices}>
            {choices.map((choice) => (
              <li key={choice.label} className={styles.choice}>
                <Button onClick={choice.onChoose}>{choice.label}</Button>
                <p className={styles.effects}>{choice.effects}</p>
              </li>
            ))}
          </ul>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
