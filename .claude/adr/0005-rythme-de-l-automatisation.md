# ADR 0005 — Rythme de l'automatisation face au temps de vie

- **Statut** : accepté
- **Date** : 2026-10-11
- **Issue** : #46 (à appliquer dans V1-11 / #15 et V1-24 / #28)

## Contexte

Le simulateur de la MR #40 (valeurs provisoires) montre que l'automatisation
arrive trop tard et trop vite :

- la vie dure 95 min de jeu actif (cible : 30–60 min) ;
- le premier employé arrive à 65 ans et le travail auto à 70 ans, alors que
  `docs/game/v1.md` § 4 veut que « la vieillesse rende l'automatisation
  nécessaire » ;
- une action auto toutes les 2 s fait que 1 h d'absence vaut 15 ans de vie ;
- le joueur virtuel clique sans arrêt, même une fois l'auto active.

## Décision

### 1. Le rythme de l'auto est rapporté au rythme manuel

L'auto n'a pas de durée fixe en secondes : elle est **proportionnelle à la
cadence de référence d'un joueur actif**. Le coefficient est en données
(`src/game/data/`), pas dans le code.

- **Coefficient : ¼.** Si n clics manuels font avancer la partie de 8 h
  d'horloge, l'auto n'avance que de n/4 sur ces 8 h.
- Équivalence : **8 h d'absence valent 2 h de jeu actif.**
- Cela vaut pour l'auto quand le joueur est présent comme pour le rattrapage
  d'une absence (`catchUp` et `autoTick` partagent le même coefficient).
- Cela **remplace le « deux fois moins vite » de `docs/game/v1.md` § 6** : le
  rythme passe de ½ à ¼. Le gain par action reste « moitié moins » ; V1-24
  cale les deux au simulateur.

### 2. La mort pendant l'absence est voulue

Une vie dure 30 à 60 min de jeu actif : une nuit (2 h de jeu actif) peut donc
couvrir une vie entière. C'est **une conséquence assumée** de l'idle, pas un
défaut. Le rattrapage s'arrête à la mort et l'écran « pendant votre
absence » l'annonce (V1-11). Aucun plafond n'est ajouté.

### 3. L'auto est accessible avant 60 ans

Le premier employé et le travail auto doivent arriver à mi-vie (cible : entre
35 et 45 ans), pour que la vieillesse rende l'auto *nécessaire* et non
simplement disponible. Leviers, dans cet ordre : baisser le prix, assouplir la
condition « Phase Patron », puis seulement déplacer la place du premier
employé. Les valeurs exactes sont à caler dans V1-24.

### 4. Le simulateur modélise un joueur qui lâche la souris

Dès que l'auto est active, le joueur virtuel arrête de cliquer (il attend, et
le temps d'attente compte comme temps d'idle, pas de jeu actif). La durée
« active » mesurée représente alors un joueur qui s'appuie sur l'idle. Le
test de V1-15 / #19 s'y adapte : la cible de 30–60 min et la zone morte
d'environ 1 min se mesurent avec ce comportement.

## Conséquences

- V1-11 lit le coefficient en données et ne code aucune durée fixe d'action
  auto.
- V1-15 gère l'arrêt des clics du joueur virtuel une fois l'auto active.
- V1-24 équilibre dessus : jalons de l'auto entre 35 et 45 ans, vie de
  30–60 min, zone morte d'environ 1 min.
- `docs/game/v1.md` § 6 renvoie à cet ADR pour le rythme.
