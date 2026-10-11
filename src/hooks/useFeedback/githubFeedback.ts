export const feedbackRepository = 'rlecellier/clicker3';
// Le workflow `feedbackLabel.yml` repère ce marqueur pour poser le label :
// GitHub ignore `labels` quand l'auteur n'a pas les droits de triage.
export const feedbackMarker = '<!-- clicker3-feedback -->';

export type FeedbackDraft = { title: string; message: string };

export const isDraftComplete = ({ title, message }: FeedbackDraft) =>
  title.trim() !== '' && message.trim() !== '';

export const buildIssue = (draft: FeedbackDraft, context: string) => ({
  title: draft.title.trim(),
  body: `${draft.message.trim()}\n\n---\n_Envoyé depuis le jeu (${context})._\n${feedbackMarker}`,
  labels: ['feedback'],
});

// Erreur d'API, avec le statut HTTP pour distinguer un jeton expiré.
export class GithubError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`GitHub a répondu ${String(status)}`);
    this.status = status;
  }
}

// Crée l'issue au nom du joueur (son jeton) et renvoie son adresse.
export const createIssue = async (
  token: string,
  draft: FeedbackDraft,
  context: string,
): Promise<string> => {
  const response = await fetch(
    `https://api.github.com/repos/${feedbackRepository}/issues`,
    {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(buildIssue(draft, context)),
    },
  );
  if (!response.ok) {
    throw new GithubError(response.status);
  }
  const issue = (await response.json()) as { html_url: string };
  return issue.html_url;
};
