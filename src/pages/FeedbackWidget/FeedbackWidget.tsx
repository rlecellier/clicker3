import { FeedbackButton } from '@component/FeedbackButton';
import { FeedbackForm } from '@component/FeedbackForm';
import { feedbackAuthUrl, useFeedback } from '@hook/useFeedback';
import styles from './FeedbackWidget.module.css';

const FeedbackWidgetContent = () => {
  const feedback = useFeedback();
  return (
    <div className={styles.widget}>
      {feedback.isOpen ? (
        <div className={styles.panel}>
          <FeedbackForm
            isSignedIn={feedback.isSignedIn}
            title={feedback.title}
            message={feedback.message}
            status={feedback.status}
            canSubmit={feedback.canSubmit}
            onTitleChange={feedback.setTitle}
            onMessageChange={feedback.setMessage}
            onLogin={feedback.login}
            onSubmit={() => void feedback.submit()}
            onClose={feedback.close}
          />
        </div>
      ) : null}
      {feedback.isOpen ? null : <FeedbackButton onClick={feedback.open} />}
    </div>
  );
};

// Sans adresse de worker OAuth (dev, e2e), le formulaire n'existe pas.
export const FeedbackWidget = () =>
  feedbackAuthUrl ? <FeedbackWidgetContent /> : null;
