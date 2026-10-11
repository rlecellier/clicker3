import { useCallback, useEffect, useState } from 'react';
import { createIssue, GithubError, isDraftComplete } from './githubFeedback';

// Adresse du worker OAuth (voir docs/feedback.md). Absente : pas de formulaire.
export const feedbackAuthUrl = import.meta.env.VITE_FEEDBACK_AUTH_URL as
  string | undefined;

const messageType = 'clicker3-feedback-auth';

export type FeedbackStatus =
  | { kind: 'idle' }
  | { kind: 'signing-in' }
  | { kind: 'sending' }
  | { kind: 'sent'; issueUrl: string }
  | { kind: 'error'; reason: string };

// Lit la réponse du worker ; tout ce qui n'a pas la bonne forme est ignoré.
const readAuthMessage = (data: unknown) => {
  if (typeof data !== 'object' || data === null) {
    return;
  }
  const { type, token, error } = data as Record<string, unknown>;
  if (type !== messageType) {
    return;
  }
  return {
    token: typeof token === 'string' ? token : undefined,
    error: typeof error === 'string' ? error : 'Connexion impossible.',
  };
};

const describeError = (error: unknown) => {
  return error instanceof GithubError && error.status === 403
    ? 'GitHub refuse la création de l’issue (droits insuffisants).'
    : 'L’envoi a échoué, réessayez dans un instant.';
};

export const useFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FeedbackStatus>({ kind: 'idle' });

  useEffect(() => {
    if (!feedbackAuthUrl) {
      return;
    }
    const authOrigin = new URL(feedbackAuthUrl).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== authOrigin) {
        return;
      }
      const result = readAuthMessage(event.data);
      if (!result) {
        return;
      }
      if (result.token) {
        setToken(result.token);
        setStatus({ kind: 'idle' });
      } else {
        setStatus({ kind: 'error', reason: result.error });
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const login = useCallback(() => {
    const popup = window.open(
      `${feedbackAuthUrl ?? ''}/login`,
      'clicker3-github',
      'width=600,height=700',
    );
    setStatus(
      popup
        ? { kind: 'signing-in' }
        : { kind: 'error', reason: 'Fenêtre de connexion bloquée.' },
    );
  }, []);

  const draft = { title, message };
  const canSubmit = token !== null && isDraftComplete(draft);

  const submit = useCallback(async () => {
    if (token === null || !isDraftComplete({ title, message })) {
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const issueUrl = await createIssue(
        token,
        { title, message },
        location.pathname,
      );
      setTitle('');
      setMessage('');
      setStatus({ kind: 'sent', issueUrl });
    } catch (error) {
      if (error instanceof GithubError && error.status === 401) {
        setToken(null);
        setStatus({
          kind: 'error',
          reason: 'Session GitHub expirée, reconnectez-vous.',
        });
        return;
      }
      setStatus({ kind: 'error', reason: describeError(error) });
    }
  }, [token, title, message]);

  return {
    isOpen,
    isSignedIn: token !== null,
    title,
    message,
    status,
    canSubmit,
    setTitle,
    setMessage,
    login,
    submit,
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      // Un envoi réussi se referme proprement ; une erreur reste à relire.
      setStatus((current) =>
        current.kind === 'sent' ? { kind: 'idle' } : current,
      );
    },
  };
};
