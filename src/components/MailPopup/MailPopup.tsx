import { Button } from '@component/Button';
import { PageLink } from '@component/PageLink';
import styles from './MailPopup.module.css';

type MailPopupProperties = {
  date: string;
  text: string;
  // Messages arrivés en plus de celui-ci pendant que la popup était affichée.
  otherCount: number;
  mailPath: string;
  onDismiss: () => void;
  // Survol et focus : l'appelant suspend la fermeture automatique.
  onPause: () => void;
  onResume: () => void;
};

// Popup non bloquante pour le dernier message reçu : ni modale ni piège à
// focus. Le placement (hors flux) revient à l'appelant.
export const MailPopup = ({
  date,
  text,
  otherCount,
  mailPath,
  onDismiss,
  onPause,
  onResume,
}: MailPopupProperties) => (
  <aside
    className={styles.popup}
    role="status"
    onMouseEnter={onPause}
    onMouseLeave={onResume}
    onFocus={onPause}
    onBlur={onResume}
  >
    <div className={styles.body}>
      <span className={styles.date}>Nouveau message · {date}</span>
      <span className={styles.text}>{text}</span>
      {otherCount > 0 && (
        <span className={styles.date}>
          et {otherCount}{' '}
          {otherCount === 1 ? 'autre message' : 'autres messages'}
        </span>
      )}
    </div>
    <div className={styles.actions}>
      <PageLink to={mailPath}>Ouvrir le courrier</PageLink>
      <Button onClick={onDismiss}>Fermer</Button>
    </div>
  </aside>
);
