# Simulateur de vie

> Statut : en place (V1-15), équilibré en V1-24 ([equilibrage.md](equilibrage.md)).

Le simulateur joue une vie complète, de 18 ans à la mort, avec un **joueur
virtuel** déterministe, sans interface. Il répond aux critères de fin de la v1
([v1.md](v1.md#10-la-v1-est-finie-quand)) : durée, phases atteintes, zones
mortes.

- Code : `src/game/simulator/`.
- Courbe en console : `npm run sim` (option `--csv` pour une ligne par période).
- Test : `src/game/simulator/simulator.test.ts`.

## Le joueur virtuel

Une stratégie gloutonne : à chaque action, dans cet ordre.

1. Activer le travail ou le sommeil automatique dès que l'amélioration est achetée.
2. Acheter : le meilleur emploi, un quartier à débloquer, ou **le moins cher**
   des achats utiles (améliorations, et l'entreprise qui équilibre production
   et vente). Les achats qui alourdissent loyer ou salaires doivent rester
   couverts par les recettes de la dernière période. On ne produit pas au-delà
   de la capacité de l'entrepôt.
3. Dormir quand les marqueurs sont pleins (sauf sommeil automatique actif).
4. Étudier la stat qui manque au prochain achat, si la formation est achetée et
   que l'argent suffit largement.
5. Vendre le surplus tant qu'aucun commerce n'existe.
6. Sinon travailler : à l'emploi, ou dans l'entreprise qui limite la chaîne si
   cela rapporte plus.

## Le temps de jeu actif

- Une action manuelle prend `humanCadenceMs` (1 seconde, constante dans
  `config.ts`). Un achat est une action.
- Les actions automatiques tournent **en parallèle** (règles de `autoTick`,
  rythme de l'auto : deux actions par seconde, ADR 0005).
- **Une fois le travail automatique actif, le joueur virtuel lâche la souris**
  (ADR 0005) : il ne fait plus que des achats, et dort quand les marqueurs sont
  pleins faute de sommeil automatique. Le reste du temps il **attend**
  (`waitStepMs`, 5 s par pas) ; ce temps compte comme attente, pas comme jeu actif.
- Durée de jeu actif = actions manuelles × cadence. Durée totale = jeu actif +
  attente. La cible de 30 à 60 minutes porte sur le jeu actif ; la zone morte
  se mesure sur la durée totale, car c'est ce que le joueur ressent.

## Ce qui est mesuré

| Mesure            | Sens                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| Durée estimée     | Temps de jeu actif jusqu'à la mort, temps d'attente et durée totale    |
| Jalons            | Âge et minute de la première entreprise, du premier employé, des automatismes, de chaque quartier |
| Phases atteintes  | Jeune adulte, Entrepreneur, Patron, Senior, dans l'ordre de la vie     |
| Zone morte        | Plus long intervalle sans achat, déblocage ni palier de stat, jusqu'à la mort comprise |
| Courbe            | Argent, stock, réputation, entreprises, améliorations, recettes par période |

## Critères de la v1

Le test vérifie que la vie va à son terme, qu'elle est déterministe, que chaque
phase est atteinte, que la vie dure de 30 à 60 minutes de jeu actif, qu'aucune
zone morte ne dépasse une minute, que le travail automatique arrive entre 35 et
45 ans et qu'une nuit d'absence (8 h) tue le personnage alors qu'une courte
absence ne le tue pas. `npm run sim` affiche aussi la liste des zones mortes de
plus d'une minute.

## Dernier relevé (valeurs équilibrées, V1-24)

- Jeu actif : **36 min 28 s** (cible 30 à 60), plus 149 min 45 s d'attente.
- Phases : toutes atteintes (patron à 27 ans).
- Plus longue zone morte : 56 s ; aucune au-delà d'une minute.
- Premier employé à 27 ans, sommeil automatique à 37 ans, travail automatique
  à 44 ans.

Détail des valeurs et limites : [equilibrage.md](equilibrage.md).
