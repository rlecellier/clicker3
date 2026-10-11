---
name: merge-request
description: Use before pushing a branch for review or opening / updating a merge request (pull request). Runs the pre-push checklist and writes a clear, well-formatted MR title and description. A MR without a description is never pushed for review.
---

# Merge request

Run this skill **before every push for review** and before opening or updating
a MR. Do not open a MR unless the user asked for one.

## 1. Pre-push checklist

Go through every item. Fix what fails, do not push on a red item.

**History**

- [ ] Every commit is a unit commit with a gitmoji message (see the `commit`
      skill); no `wip`, `fix lint`, `address review` or leftover `fixup!`.
- [ ] `git log --oneline <base>..HEAD` reads like a changelog.
- [ ] The branch is up to date with its base (merge or rebase per repo
      convention), no conflict.

**Quality**

- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run format:check` and `npm test`
      pass; `npm run e2e` too when the change is visible in the browser.
- [ ] `npm run build` succeeds when the change touches build config, routing or
      dependencies.
- [ ] Every new or changed user action is covered by at least one Playwright
      journey. Purely visual components have no test (see `CLAUDE.md`).
- [ ] The code follows the project structure ADR (`.claude/adr/`): one folder
      per component / hook / context, `index.ts` per folder, aliases instead
      of `../`.
- [ ] No debug code, commented-out code, stray `console.log`, or unrelated
      changes.

**Safety**

- [ ] No secret, token, credential or personal data in the diff or the
      description (`git diff <base>...HEAD`).
- [ ] No generated or local files committed (`dist/`, `node_modules/`,
      `tsconfig.tsbuildinfo`, scratch files).

**Description**

- [ ] The MR has a title **and** a description. This item is blocking: never
      push a MR for review without one.
- [ ] The description follows the structure below and is accurate against the
      final diff, not against an earlier draft.

## 2. Title

`<gitmoji> <imperative summary>`, under 72 characters, same convention as the
commits. When the MR has a single commit, reuse its subject. When it has
several, name the overall goal, not the first commit.

```
✨ add working day button and progress bar
```

## 3. Description

Use `.github/pull_request_template.md` as the layout. Fill every section or
delete it; never leave placeholder comments in the final text. Write for a
reviewer who has not seen the conversation.

| Section | Content |
| ------- | ------- |
| 🎯 Why | The problem or need, in one or two sentences. Link the issue. |
| ✨ What changed | Bullets grouped by theme, written as outcomes, not file lists. |
| 🧪 How to test | Numbered, concrete steps and the expected result. |
| 📸 Screenshots | UI changes only. Remove the section otherwise; the demo workflow posts its own comment (see below). |
| ⚠️ Notes for reviewers | Trade-offs, risks, follow-ups, what is out of scope. |
| ✅ Checklist | The items from the template, ticked only if true. |

Make it pleasant to read:

- Lead with the *why*; a reviewer should grasp the intent in ten seconds.
- Short paragraphs and bullets, one idea each. Bold the one thing to look at.
- Reference code as `path/File.tsx` in backticks; link issues and commits.
- Use a table for comparisons or option trade-offs, a diagram only when it
  explains a flow better than words.
- Keep the emoji headings from the template, and nothing more decorative.
- Never claim a check passed that was not run.

Keep any attribution footer required by the environment at the very end.

## 4. Example

```markdown
## 🎯 Why

The game needed a second way to earn money that trades clicking for waiting.

## ✨ What changed

- **Working day**: a 5 s action that disables every other action, then pays
  10 clicks at once (`hooks/useGame`).
- Progress bar while the day runs (`components/WorkingDayProgress`).

## 🧪 How to test

1. `npm run dev` and open the game.
2. Click **Working day**: both buttons are disabled for 5 s.
3. When the bar fills, the balance increases by $10.

## ✅ Checklist

- [x] Unit commits with gitmoji messages, no intermediate commits
- [x] `npm run lint`, `npx tsc --noEmit` and `npm test` pass
- [x] Each new user action is covered by a Playwright journey
- [x] Follows the project structure ADR
```

## 5. Demo

The demo is on demand and never adds demo-only code. Commenting `/demo` on the
MR (a collaborator only) starts the `MR demo` workflow
(`.github/workflows/demo.yml`): it runs the Playwright e2e journeys
(`e2e/*.e2e.ts`) on the current head and posts as a comment the screenshots that
this MR lists in `e2e/demo.json`. Comment again after a push to refresh it.

To show a feature, add `await demoShot(page, 'my-shot')` (from
`e2e/support`) at the right step of a journey that is a real test:
it asserts the behavior and stays after the merge. Then list `my-shot` in
`e2e/demo.json`. Never commit a script that exists only to film a feature.
`e2e/demo.json` belongs to the MR: set it to this MR's screenshots, and empty
the list (`{ "screenshots": [] }`) when none applies.

The files live on the `mr-assets` branch and are deleted, with the comment, when
the MR is merged or closed.

Locally: `DEMO=1 npm run e2e` writes the listed screenshots to `demo/`.

## 6. Then

Push to the designated branch. Open the MR only if asked; when opening it, pass
the title and the finished description, not the template.
