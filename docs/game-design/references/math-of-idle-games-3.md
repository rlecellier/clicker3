# The Math of Idle Games, partie III

- **Auteur** : Anthony Pecorella (février 2017)
- **URL** : https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii
  (original : https://www.kongregate.com/en/pages/the-math-of-idle-games-part-iii)
- **Lecture** : extraits via recherche web (voir le [README](README.md))

## Contenu

Dernière partie de la série : **boucles et motifs de prestige**, appuyée sur des
modèles de tableur que l'auteur met à disposition.

## Points retenus

- **Entrées de la formule de gain de prestige** : statistiques sur toute la
  partie (_lifetime_) ou depuis le dernier reset.
  - Gains maximaux : Realm Grinder.
  - Gains cumulés sur la vie : Cookie Clicker, AdVenture Capitalist.
  - Gains depuis le dernier reset : Egg, Inc.
  - Améliorations achetées depuis le dernier reset : Clicker Heroes.
- **Racine carrée** (Realm Grinder sur le max, AdVenture Capitalist sur les
  gains cumulés) : doubler la monnaie de prestige demande 4× plus que la partie
  précédente ; gain d'une partie à l'autre de l'ordre de 3 à 4×. Sur le maximum,
  resetter au même point ne rapporte rien de plus.
- **Racine cubique** (Cookie Clicker, gains cumulés) : doubler demande environ
  8× plus ; avancer plus loin rapporte vite de moins en moins.
- **Depuis le dernier reset** (Egg, Inc.) : on peut resetter au même point en
  gagnant à chaque fois, mais de moins en moins ; il faut progresser pour gagner
  sensiblement.
- **Quand prestigier** : règle empirique de resetter quand on gagnerait environ
  **+50 % à +200 %** de monnaie de prestige. Pour concevoir la formule : un
  logarithme ou un exposant fractionnaire (racine carrée) pour freiner la
  croissance, et s'assurer que le joueur atteint régulièrement un point de
  prestige intéressant.

## À faire

Les dérivations exactes et les modèles de tableur n'ont pas été vus : à
compléter avant de concevoir le prestige.

## Utilisé dans

[Game design](../README.md), § 4 « Prestige ».
