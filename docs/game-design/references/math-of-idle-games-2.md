# The Math of Idle Games, partie II

- **Auteur** : Anthony Pecorella
- **URL** : https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii
  (original : https://www.kongregate.com/en/pages/the-math-of-idle-games-part-ii)
- **Lecture** : extraits via recherche web (voir le [README](README.md))

## Contenu

Modèles de croissance **alternatifs** au modèle « Cookie Clicker »
(exponentiel) que la grande majorité des idle games utilisent, et interaction
entre générateurs.

## Points retenus

- **Modèle par dérivées** : chaque palier de générateur est la dérivée du
  palier du dessous (Gen 1 = f(x), Gen 2 = f′(x), Gen 3 = f″(x)…). Les
  intégrations successives donnent les termes `1, x, x²/2, x³/6, …, xⁿ/n!`.
- **Exemple** : avec quatre paliers et un seul Gen 4 au départ, la monnaie croît
  en `x⁴/24`, et le nombre total de générateurs au temps `t` vaut
  `1 + t + t²/2 + t³/6`.
- **Lien avec l'exponentiel** : plus il y a de paliers, plus la somme tend vers
  `eˣ`. Une longue chaîne de générateurs se comporte comme une croissance
  exponentielle.
- **Pertinence des générateurs** : les paliers bas peuvent devenir inutiles pour
  le joueur, ce qui complique l'équilibrage et la compréhension. Pistes citées
  (d'après la présentation GDC associée) : multiplicateurs agressifs pour les
  garder pertinents, bases liées au nombre possédé de chaque générateur.
- **Complément** : le tableur « Simple Derivative Growth Model » de l'auteur
  accompagne l'article.

## À faire

Les formules détaillées de pertinence et de multiplicateurs ne figuraient pas
dans les extraits : à compléter à la lecture de l'article.

## Utilisé dans

[Game design](../README.md), § 3.
