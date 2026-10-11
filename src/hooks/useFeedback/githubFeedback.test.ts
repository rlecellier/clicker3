import { buildIssue, feedbackMarker, isDraftComplete } from './githubFeedback';

describe('buildIssue', () => {
  it('porte le label et le marqueur lu par le workflow', () => {
    const issue = buildIssue(
      { title: ' Bug ', message: ' Ça plante ' },
      '/jeu',
    );
    expect(issue.title).toBe('Bug');
    expect(issue.labels).toEqual(['feedback']);
    expect(issue.body).toContain('Ça plante');
    expect(issue.body).toContain(feedbackMarker);
  });
});

describe('isDraftComplete', () => {
  it('refuse un champ vide ou blanc', () => {
    expect(isDraftComplete({ title: 'a', message: '  ' })).toBe(false);
    expect(isDraftComplete({ title: '', message: 'b' })).toBe(false);
    expect(isDraftComplete({ title: 'a', message: 'b' })).toBe(true);
  });
});
