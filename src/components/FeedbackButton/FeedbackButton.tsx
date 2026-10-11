import { MessageSquare } from 'lucide-react';
import styles from './FeedbackButton.module.css';

type FeedbackButtonProperties = { onClick: () => void };

export const FeedbackButton = ({ onClick }: FeedbackButtonProperties) => (
  <button
    type="button"
    className={styles.button}
    onClick={onClick}
    aria-label="Envoyer un retour"
    title="Envoyer un retour"
  >
    <MessageSquare aria-hidden="true" size={22} />
  </button>
);
