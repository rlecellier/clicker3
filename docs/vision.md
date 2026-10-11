# Vision du projet

## But

**Créer un idle clicker** (jeu incrémental) jouable dans le navigateur, sur la
[stack de clicker 1](stack.md).

Clicker 3 repart de zéro côté gameplay : la vie quotidienne de clicker 1
(calories, métier, calendrier) n'est pas reprise. On garde la stack, l'architecture
en couches et les conventions ; on change de jeu.

## Principes

- **Logique pure d'abord** : les règles vivent dans `src/game/`, testées sans
  navigateur, avec un état sérialisable (sauvegarde et progression hors-ligne
  possibles dès le départ).
- **Piloté par les données** : générateurs et améliorations décrits dans des
  fichiers de données.
- **Petite v1** : une boucle complète et agréable avant d'ajouter des couches.

## Avancement

| Étape | Contenu                                                              | Statut  |
| ----- | -------------------------------------------------------------------- | ------- |
| 1     | Documentation de la stack ([stack.md](stack.md))                     | fait    |
| 2     | But du repo (ce document)                                            | fait    |
| 3     | Recherche game design ([game-design-idle.md](game-design/README.md)) | fait    |
| 4     | **Choix du thème et des mécaniques** ([game/](game/README.md))       | fait     |
| 5     | Initialisation du code (Vite, lint, CI…)                             | à faire |
