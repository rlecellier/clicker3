# Le sommeil et la journée de 24 h

> Statut : décidé (issue #261, [ADR 0013](../../.claude/adr/0013-journee-de-24-heures.md)).

## Principe

Une période est une **journée de 24 h** qui simule un mois : le joueur voit la
date (janvier, février…), jamais une horloge. Le temps de sommeil n'est pas un
choix. Il vaut :

`sommeil = base de la tranche de vie + h « dormir plus » − h « dormir moins »`

borné à 4–12 h. Le reste est le **temps d'éveil**, et c'est lui que la jauge
mesure, en minutes : 8 h de sommeil laissent 16 h, soit 960 minutes.

## Base de sommeil par tranche de vie

| Tranche        | Âges            | Base  |
| -------------- | --------------- | ----- |
| Petite enfance | 0 à 5 ans       | 12 h  |
| Enfance        | 6 à 12 ans      | 10 h  |
| Adolescence    | 13 à 17 ans     | 9 h   |
| Jeunesse       | 18 à 29 ans     | 8 h   |
| Âge adulte     | 30 à 49 ans     | 7 h   |
| Maturité       | 50 à 64 ans     | 7 h   |
| Vieillesse     | 65 ans à la fin | 6 h   |

La base est lue d'après l'âge au passage de période : le jeu complet la fait
changer en cours de partie.

## Durée des actions

Chaque action déclare sa durée en minutes (`minutes`), sans palier : 15, 20,
45 ou 200 minutes sont des valeurs comme les autres. Le nombre de fois qu'on
peut la faire par période est `éveil / durée`. Dormir une heure de moins ajoute
60 minutes d'éveil et donc des actions, quelle que soit leur durée. Des boosts
pourront réduire la durée d'une action minute par minute.

Départ : travail 200 min, étude 300 min (même nombre d'actions par période
qu'avant ce changement). Heures supplémentaires : à partir de 600 min de travail
dans la période (+25 %), puis 1 000 min (+35 %) ; chaque action en heures sup.
dure 35 % de plus.

## La nuit

À la clôture de la période, tous les marqueurs (le cerveau) sont convertis en
points de stat d'un coup, sans pause ni barre : `points = 1 × logement ×
(1 + coup de pouce) × rendement`. Le rendement d'apprentissage vaut `(base + h
« dormir plus ») / base` : dormir plus apprend mieux, dormir moins (« Optimiser
son sommeil ») n'y change rien. Le nombre de marqueurs convertis s'affiche dans
le bilan de nuit de l'onglet Vie.

## Ce que le joueur voit

- Onglet Vie : « Sommeil : X h par jour (éveil : Y h) » avec la base de l'âge et
  les bonus, et le bilan de la dernière nuit.
- Sur chaque bouton d'action : « encore N fois » (le nombre d'actions que le
  temps d'éveil restant permet), jamais de durée ni d'horloge.

## Améliorations

| Famille                 | Effet                                        | Effet de jeu                                  |
| ----------------------- | -------------------------------------------- | --------------------------------------------- |
| Dormir mieux            | `sleepMore` : +1 h de sommeil                | Moins d'éveil, apprentissage meilleur         |
| Optimiser son sommeil   | `sleepLess` : −1 h de sommeil                | Plus d'éveil, apprentissage inchangé          |

Le détail (noms, prix) est dans `src/game/data/upgrades.ts`.
