import { Button } from '@component/Button';
import { Note } from '@component/Note';
import { Window } from '@component/Window';
import type { FeedbackStatus } from '@hook/useFeedback';
import styles from './FeedbackForm.module.css';

type FeedbackFormProperties = {
  isSignedIn: boolean;
  title: string;
  message: string;
  status: FeedbackStatus;
  canSubmit: boolean;
  onTitleChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onLogin: () => void;
  onSubmit: () => void;
  onClose: () => void;
};

export const FeedbackForm = ({
  isSignedIn,
  title,
  message,
  status,
  canSubmit,
  onTitleChange,
  onMessageChange,
  onLogin,
  onSubmit,
  onClose,
}: FeedbackFormProperties) => (
  <Window
    title="Retour d’expérience"
    actions={
      <Button onClick={onClose} size="normal">
        Fermer
      </Button>
    }
  >
    {status.kind === 'sent' ? (
      <>
        <Note>
          Merci, votre retour est enregistré.{' '}
          <a href={status.issueUrl} target="_blank" rel="noreferrer">
            Voir l’issue sur GitHub
          </a>
        </Note>
        <Button onClick={onClose}>Fermer</Button>
      </>
    ) : (
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Note>
          Un compte GitHub est nécessaire : le retour est publié en tant
          qu’issue publique, à votre nom.
        </Note>
        {isSignedIn ? (
          <>
            <label className={styles.field}>
              Titre
              <input
                className={styles.input}
                value={title}
                maxLength={120}
                onChange={(event) => {
                  onTitleChange(event.target.value);
                }}
              />
            </label>
            <label className={styles.field}>
              Message
              <textarea
                className={styles.input}
                rows={6}
                value={message}
                onChange={(event) => {
                  onMessageChange(event.target.value);
                }}
              />
            </label>
            <Button
              type="submit"
              variant="primary"
              isDisabled={!canSubmit}
              isPending={status.kind === 'sending'}
            >
              Envoyer
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onLogin}>
            {status.kind === 'signing-in'
              ? 'Connexion en cours… (rouvrir)'
              : 'Se connecter avec GitHub'}
          </Button>
        )}
        {status.kind === 'error' ? (
          <p role="alert" className={styles.error}>
            {status.reason}
          </p>
        ) : null}
      </form>
    )}
  </Window>
);
