---
name: commit
description: Use when creating git commits, finishing a task, or preparing a branch / merge request. Enforces unit (atomic) commits with gitmoji messages and forbids intermediate commits (WIP, fixup, "address review", "fix lint") in a merge request.
---

# Commit

Every commit is a **unit commit**: one logical change, complete, that stands on
its own. A merge request is a series of such commits, nothing else.

Messages follow the gitmoji convention: load the `gitmoji` skill to pick the
emoji and write the message.

## Rules

1. **One commit = one intent.** A feature, a fix, a refactor, a config change
   or a doc update are separate commits. If the message needs "and", split it.
2. **Each commit is self-contained and green.** At every commit, the project
   builds and `npm run lint`, `npx tsc --noEmit` and `npm test` pass. Tests and
   docs for a change go in the same commit as the change, not in a later one.
3. **No intermediate commits in a merge request.** Forbidden: `wip`, `fix typo`
   on your own earlier commit, `fix lint`, `address review comments`,
   `oops`, `fixup!` / `squash!` left in the branch, a commit that only undoes
   or patches a previous commit of the same MR.
4. **Fix the commit it belongs to, don't add one.** When a check fails or a
   reviewer asks for a change on code introduced by a commit of this MR, fold
   the change into that commit (see "Folding a fix") instead of stacking a new
   one.
5. **Stage deliberately.** Stage by path or by hunk (`git add <paths>`,
   `git add -p`), never `git add -A` / `git add .` without reading
   `git status` and `git diff --staged` first. Unrelated changes do not ride
   along.
6. **Message:** gitmoji + imperative subject under 72 characters. Add a body
   when the *why* is not obvious. Keep any trailer or attribution required by
   the environment.

## Workflow

1. `git status` and `git diff`: list the independent changes in the working
   tree.
2. Group them by intent. Plan one commit per group, in dependency order
   (e.g. dependency/config first, then the code that uses it).
3. For each group: stage only its files/hunks, run the checks, read
   `git diff --staged`, commit.
4. `git log --oneline <base>..HEAD`: every line must be a unit commit. If one
   is an intermediate commit, fold it (below) before pushing.

## Folding a fix into an earlier commit

On a branch you created and own, and only before it is merged:

```bash
git add <paths>
git commit --fixup=<sha-of-the-commit-to-fix>
GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash <base>
git push --force-with-lease
```

(For the very last commit, `git commit --amend --no-edit` is enough.)

Never rewrite history on a branch someone else owns or that is already merged;
in that case say so and ask instead of adding a patch commit silently.

## Splitting a commit that does too much

```bash
git reset --soft HEAD~1
git reset
# then stage and commit each group separately
```

## Examples

```
✨ add working day button
✅ test working day reward with factory data
♻️ extract MoneyCounter component
🔧 add @page, @component and @hook import aliases
```

Not acceptable in a merge request:

```
wip
🐛 fix lint
🩹 address review
✨ add working day button + refactor routes + bump deps
```
