# The Math of Idle Games, partie I

- **Auteur** : Anthony Pecorella (producteur d'AdVenture Capitalist mobile)
- **Publication** : blog développeurs de Kongregate, repris par Game Developer
- **URL** : https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i
- **Lecture** : extraits (voir le [README](README.md))

## Contenu

Première partie d'une série de trois sur les mathématiques « sous le capot » des
idle et incremental games. Elle pose le vocabulaire et le modèle de base.

## Points retenus

- **Coût du prochain générateur** : `coût = coûtBase × croissance ^ possédés`.
  Pour le Lemonade Stand d'AdVenture Capitalist, la croissance est de **1,07**.
- **Production totale** : `productionBase × possédés × multiplicateurs`.
  Exemple de l'article : avec 10 Lemonade Stands, la production atteint
  16,7 / s (base 1,67 / s) et le coût du suivant est d'environ 7,87.
- **Moteur du genre** : coûts exponentiels face à une production linéaire ou
  polynomiale. Tôt, la production dépasse les coûts ; plus tard, les coûts
  deviennent la contrainte.
- **Multiplicateurs** : améliorations qui rapprochent (temporairement) la
  production des coûts, voire la mettent devant.
- **Prestige (glossaire)** : réinitialisation de la plupart des éléments
  (surtout générateurs et multiplicateurs) contre une monnaie de prestige et/ou
  des multiplicateurs persistants qui accélèrent la partie suivante.

## Utilisé dans

[Game design](../README.md), § 3 « Les mathématiques ».
