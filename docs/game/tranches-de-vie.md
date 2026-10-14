# Tranches de vie

> Statut : point d'entrée posé (issue #242) ; le gameplay de chaque tranche reste
> à écrire, une tranche après l'autre.

## Idée

Une vie se découpe en **tranches de vie**. À l'écran titre, le joueur choisit
celle où il commence. On développe ensuite le jeu tranche par tranche : chacune
doit avoir un gameplay intéressant, une durée de jeu suffisante et des éléments
qui servent à la suivante. On teste une tranche isolément, puis on vérifie
qu'elle s'articule avec les autres, avant de tout assembler en un seul jeu qui
commence à la naissance.

Le terme est **« tranche de vie »** : `period` désigne déjà un mois dans le code
et `phase` les paliers de la v1 (`youngAdult`, `entrepreneur`, `boss`), on
n'emploie ni l'un ni l'autre.

## Les sept tranches

Le découpage suit **ce que le joueur fait**, pas l'état civil.

| Tranche        | Âges           | Verbe       | État dans le jeu                         |
| -------------- | -------------- | ----------- | ---------------------------------------- |
| Petite enfance | 0 à 5 ans      | explorer    | Mini-jeu : un bouton et un compteur      |
| Enfance        | 6 à 12 ans     | jouer       | Mini-jeu : un bouton et un compteur      |
| Adolescence    | 13 à 17 ans    | se chercher | Mini-jeu : un bouton et un compteur      |
| Jeunesse       | 18 ans à la fin| tenter, bâtir | **Le jeu actuel** (v1), de 18 ans à la mort |
| Âge adulte     | 30 à 50 ans    | bâtir       | Couvert par Jeunesse                     |
| Maturité       | 50 à 65 ans    | transmettre | Couvert par Jeunesse                     |
| Vieillesse     | 65 ans à la fin| se souvenir | Couvert par Jeunesse                     |

Seules les quatre premières se choisissent aujourd'hui (`lifeSlices` dans
`src/game/data/lifeSlices.ts`). Les trois dernières s'ajouteront quand Jeunesse
sera découpée à son tour.

## Une coquille commune

Toutes les tranches partagent la même coquille : sidebar, style, composants
visuels. Ce qui change, ce sont **les onglets proposés** : chaque tranche liste
les siens (`tabs`). Un onglet absent de la tranche n'apparaît pas dans la
sidebar, et son adresse renvoie à l'onglet Vie. Les touches 1 à 9 gardent le
rang de la liste complète : fermer un onglet ne décale pas les autres.

Avant 18 ans, seul l'onglet **Vie** est ouvert, sans l'en-tête d'argent ni la
jauge de temps. Il affiche le nom de la tranche, ses âges, **un bouton
d'action** (« Gazouiller », « Jouer », « Se chercher ») et **un compteur**
(« Éveil », « Curiosité », « Identité »). Un appui, un tap ou un appui maintenu
fait monter le compteur d'un cran ; il ne sert à rien d'autre pour l'instant.

## Ce qui n'est pas fait

- Aucune règle propre aux tranches d'avant 18 ans (stats, lieux, durée) : elles
  viendront une à une.
- Pas de passage automatique d'une tranche à la suivante.
- Pas de modèle d'état commun refondu : `GameState` porte la tranche
  (`lifeSlice`) et le compteur (`growth`), le reste est celui de Jeunesse. On
  refactorisera quand on enchaînera les tranches ([ADR 0012](../../.claude/adr/0012-tranches-de-vie.md)).
