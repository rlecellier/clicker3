import { useCallback, useEffect, useState } from 'react';

const FEEDBACK_MS = 2500;

// Message de retour d'une action, effacé après quelques secondes. `say`
// enveloppe un geste : il le joue puis affiche le message.
export const useFeedback = () => {
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (feedback === null) {
      return;
    }
    const timer = setTimeout(() => {
      setFeedback(null);
    }, FEEDBACK_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [feedback]);

  const say = useCallback(
    (message: string, run: () => void) => () => {
      run();
      setFeedback(message);
    },
    [],
  );

  return { feedback, setFeedback, say };
};
