---
name: prompt-review
description: Use at the start of a vague, exploratory or multi-part request (game design, "je me demande", several questions at once, no issue referenced) before researching, writing or coding. Reviews the prompt, takes the open decisions itself, and outputs a standardized "Brief" of what will be done, then stops so the user can validate or reject it.
---

# Revue de prompt

Une demande large (conception de jeu, réflexion, plusieurs sujets mêlés) se
lit mal d'un seul trait : on en traite la moitié, on en invente le reste. Avant
tout travail, on fait une **revue du prompt** et on la termine par un **Brief**
au format fixe ci-dessous, puis **on s'arrête** : le Brief est le moment où
l'utilisateur valide ou invalide, rien n'est écrit ni codé avant.

Ne pas s'appliquer à une demande précise et petite (corriger un bug, renommer,
une issue déjà rédigée) : on y va directement.

## Principe : Claude décide

Le projet se code intensivement avec Claude Code. Le ton et l'objectif du jeu
sont définis (`docs/vision.md`, `docs/game/ton-et-univers.md`) : Claude **prend
l'initiative** sur tout ce qui reste ouvert, en restant cohérent avec eux. Si
l'utilisateur veut infléchir une décision, il ouvre un autre agent pour la
modifier ; Claude ne le questionne donc pas choix par choix : il propose un Brief complet,
que l'utilisateur valide d'un bloc.

- **Pas de question** par défaut. Une question n'est permise que si elle est
  irréversible ou hors du dépôt (accès manquant, choix qui contredit une
  décision écrite) ; elle va alors dans « Reste à valider ».
- Chaque décision prise est **écrite dans le Brief** avec sa raison en une
  ligne, pour qu'elle soit relue et changée plus tard.

## Étapes

1. **Lire le contexte utile, en peu d'appels.** `CLAUDE.md`, `docs/game/`
   (concept, `v1.md`, `tranches-de-vie.md`), les ADR et les issues concernés.
2. **Découper la demande** en demandes distinctes et les classer : conception,
   décision, code, doc.
3. **Trier** ce que dit l'utilisateur : *acquis* (à ne pas rediscuter), *ouvert*
   (Claude tranche), *question posée* (Claude répond).
4. **Trancher** chaque point ouvert : un choix, une raison.
5. **Écrire le Brief et s'arrêter.** Aucun fichier, issue ni code avant la
   validation. Une fois validé (ou corrigé), on exécute le plan dans l'ordre.

## Format du Brief

Toujours ces sections, dans cet ordre, en français, sans en ajouter :

```markdown
## Brief

**Objectif** : une phrase.
**Livrable** : fichier(s) ou issue(s) produits, avec leur chemin.
**Hors périmètre** : ce qu'on ne fait pas dans ce lot.

### Acquis (repris de la demande)
- …

### Décisions prises
- Sujet : choix retenu — raison en une ligne.

### Réponses aux questions posées
- Question → réponse.

### Existant réutilisé
- Fichier ou issue → ce qu'on en reprend.

### Plan (dans l'ordre d'exécution)
1. Étape → issue / commit correspondant.

### Critères de fin
- Ce qui rend le travail vérifiable.

### Reste à valider par l'utilisateur
- Aucun, ou un point irréversible.
```

## Règles

- Le Brief tient sur un écran : des puces courtes, pas de paragraphes.
- Une section sans contenu s'écrit « Aucun », elle n'est pas supprimée.
- Plus de décisions et de plan, moins de pistes : on écrit « on fait X », pas
  « on pourrait X ».
- Une demande de conception de jeu produit d'abord un **document dans
  `docs/game/`** et une **issue** (voir « Issue avant MR » dans `CLAUDE.md`),
  puis le code dans des issues séparées (une issue = une branche = une MR).
- Les décisions de game design restent dans le ton et l'objectif du jeu ; en cas
  de doute entre deux options, la plus simple à jouer et à changer.
