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
- **Où ranger un calcul partagé, quels helpers réutiliser** : ADR 0009
  (`.claude/adr/0009-couches-et-factorisation.md`). Les frontières des couches
  sont imposées par ESLint.

## Sauvegardes

Pas de rétrocompatibilité des sauvegardes entre versions du jeu : pas de
migration, de fixture ni de test de chargement d'une ancienne version tant
qu'aucune version n'est jugée populaire (ADR 0010).

## Politique de test

- **Composant uniquement visuel : pas de test.**
- **Les règles du jeu se testent en unitaire** (Vitest, sans navigateur) :
  coûts, production, prestige, hors-ligne, sauvegarde, etc.
- **Peu de parcours Playwright, longs** (`e2e/*.e2e.ts`) : un parcours raconte
  une session de joueur et enchaîne les actions dans un même test ; on garde la
  suite sous une dizaine. Toute action utilisateur fait partie d'au moins un
  parcours, mais on vérifie l'effet visible, pas chaque valeur.

- **Le jeu se joue surtout au toucher.** Les projets Playwright mobiles
  tournent en `hasTouch` : chaque type de bouton d'action (simple, appui
  maintenu) se vérifie au moins une fois avec `tap()`, pas seulement `click()`,
  car la souris ne reproduit pas l'ordre des événements tactiles (`pointerup`,
  `pointerleave`, puis `click`). Un tap doit valoir **une** action, avec le gain
  réellement affiché.
- **Un hook de geste** (appui, appui long, répétition) se teste en unitaire
  avec la séquence réelle d'un doigt (`pointerdown`, `pointerup`,
  `pointerleave`, `click`) et celle de la souris, pas seulement un clic isolé.
- **Un chiffre annoncé à l'écran** (gain d'un clic, balance) se compare à ce que
  l'action produit vraiment, dans un parcours ou un test des règles.

Rien d'autre n'est imposé : pas de test « par principe ».

## Fin de travail

On passe souvent d'un agent à l'autre : la fin du message dit s'il reste quelque
chose en cours, pour ne pas perdre de temps. Ce n'est pas lié à une formule
dans la demande.

La phrase « Mon travail est terminé. » ne se met qu'en toute fin de message, et
seulement si **tout ce qu'il était possible de faire dans la discussion est
traité** : chaque demande et chaque problème relevé est fait, invalidé (avec la
raison) ou suivi par une issue créée. Pour un développement, « fait » veut dire
la MR ouverte, la CI verte sur le dernier commit, puis mergée (voir « Merge des
MR ») ; du code poussé sur une branche n'est pas terminé.

- **Il reste du travail important** (une tâche assignée, un problème relevé, une
  MR pas poussée, pas mergée ou à la CI rouge, une question qui bloque) : on
  n'écrit pas la phrase. On liste ce qui reste à faire, point par point.
- **Il ne reste que de l'accessoire** (amélioration possible, idée, nettoyage
  facultatif) : on peut conclure par « Mon travail est terminé. » après avoir
  listé ces pistes en une ligne chacune, sous « On pourrait aussi ».
- **Rien ne reste** : on écrit seulement « Mon travail est terminé. ».

Une action qui dépend de l'utilisateur (relecture, décision, accès manquant)
est un reste important : on le dit, et on ne conclut pas.

## Documentation

Les décisions d'architecture vont dans `.claude/adr/` (un ADR numéroté par
décision). Les notes de conception du jeu vont dans `docs/`. Le guide du joueur
est dans `docs/guide-utilisateur/`.
