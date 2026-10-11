import { Button } from '@component/Button';
import styles from './EventToast.module.css';

type EventToastProperties = {
  date: string;
  text: string;
  onDismiss: () => void;
};

// Bandeau discret pour le dernier message reçu.
export const EventToast = ({ date, text, onDismiss }: EventToastProperties) => (
  <aside className={styles.toast} role="status">
    <div className={styles.body}>
      <span className={styles.date}>Nouveau message · {date}</span>
      <span className={styles.text}>{text}</span>
    </div>
    <Button onClick={onDismiss}>Fermer</Button>
  </aside>
);
