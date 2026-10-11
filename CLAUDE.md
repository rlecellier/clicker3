# Clicker 3

Un idle clicker (jeu incrémental) en React + TypeScript. Le but est décrit dans
`docs/vision.md`, la stack dans `docs/stack.md` (reprise de clicker 1) et la
recherche de game design dans `docs/game-design/README.md`.

**Avancement** : suivi dans l'issue #29 (une issue = une branche = une MR) ;
le concept et les mécaniques de la v1 sont dans `docs/game/` (périmètre dans
`docs/game/v1.md`). Ce fichier ne porte pas l'avancement : une MR de règles
ordinaire n'a pas à le modifier.

**Règles du jeu** : un module par dossier dans `src/game/`, avec son test
(`ls src/game` donne la liste à jour).

Conventions du projet : voir `.claude/adr/0001-project-structure.md`.

**UI** : guide de style dans `docs/ui/guide-de-style.md` et skill
`.claude/skills/ui-style/` (à suivre pour tout composant ou page).

## Règles de code

- **Pas de `function` déclarée.** Composants, hooks et helpers s'écrivent
  `const Nom = () => {}` (fonction fléchée assignée à un `const`), jamais
  `function Nom() {}`. Cette règle prime sur les exemples en `function` des
  skills (`react-dev`, etc.). Elle est appliquée par ESLint (`func-style`).

## Issue avant MR

Quand une demande ne référence pas d'issue, on écrit d'abord l'issue (contexte,
périmètre, critères de fin) avant d'ouvrir la MR, de préférence avant de
commencer à coder. La MR référence ensuite l'issue (`Closes #N`). Une issue =
une branche = une MR.

## Merge des MR

- **Toujours en « rebase and merge »** : on garde les commits unitaires (skill
  `commit`), donc pas de squash et pas de merge commit.
- La branche doit être linéaire : quand `main` avance, on rebase dessus
  (`git rebase origin/main`, puis `git push --force-with-lease`).
- On ne merge qu'une fois la CI verte sur le dernier commit.

## Séparation visuel / logique

- **Composants visuels** : ils affichent des props, sans état métier ni effet
  de bord, et sont réutilisables au maximum.
- **Hooks** : toute la logique (état, effets, calculs, appels au context).
- **Composants orchestrateurs** : ils branchent des hooks sur des composants
  visuels et ne font rien d'autre.
- **Règles du jeu** dans `src/game/` : TypeScript pur, sans React, avec un état
  sérialisable et un reducer pur. Le temps vient de l'état, jamais de
  `Date.now()` dans les règles.

## Politique de test

- **Composant uniquement visuel : pas de test.**
- **Les règles du jeu se testent en unitaire** (Vitest, sans navigateur) :
  coûts, production, prestige, hors-ligne, sauvegarde, etc.
- **Peu de parcours Playwright, longs** (`e2e/*.e2e.ts`) : un parcours raconte
  une session de joueur et enchaîne les actions dans un même test ; on garde la
  suite sous une dizaine. Toute action utilisateur fait partie d'au moins un
  parcours, mais on vérifie l'effet visible, pas chaque valeur.

Rien d'autre n'est imposé : pas de test « par principe ».

## Documentation

Les décisions d'architecture vont dans `.claude/adr/` (un ADR numéroté par
décision). Les notes de conception du jeu vont dans `docs/`.
