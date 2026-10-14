# Tranches de vie

> Statut : points d'entrée posés (issues #242 et #244) ; le gameplay de chaque
> tranche reste à écrire, une tranche après l'autre.

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

| Tranche        | Âges            | Verbe         | Départ                                                    |
| -------------- | --------------- | ------------- | --------------------------------------------------------- |
| Petite enfance | 0 à 5 ans       | explorer      | Mini-jeu : un bouton et un compteur                       |
| Enfance        | 6 à 12 ans      | jouer         | Mini-jeu : un bouton et un compteur                       |
| Adolescence    | 13 à 17 ans     | se chercher   | Mini-jeu : un bouton et un compteur                       |
| Jeunesse       | 18 à 29 ans     | tenter        | « Démarrer ma vie » : le jeu complet, de 18 ans à la mort |
| Âge adulte     | 30 à 49 ans     | bâtir         | Le jeu complet à 30 ans, état de départ arbitraire        |
| Maturité       | 50 à 64 ans     | transmettre   | Le jeu complet à 50 ans, état de départ arbitraire        |
| Vieillesse     | 65 ans à la fin | se souvenir   | Le jeu complet à 65 ans, état de départ arbitraire        |

Les sept se choisissent à l'écran titre (`lifeSlices` dans
`src/game/data/lifeSlices.ts`). « Démarrer ma vie » reste le départ en Jeunesse,
celui du jeu tel qu'il a été conçu : il joue ensuite toute la vie. Les six autres
boutons sont sous « Ou commencer ailleurs dans la vie : ».

## Départs en cours de vie

Âge adulte, maturité et vieillesse reprennent **le même jeu**, à un âge plus
avancé. Leur état de départ est arbitraire mais cohérent : c'est ce que le joueur
virtuel du simulateur possède à cet âge, arrondi (`src/game/data/sliceStarts.ts`).

| Tranche    | Âge | Emploi         | Argent    | Entreprises | Améliorations | Particularités                       |
| ---------- | --- | -------------- | --------- | ----------- | ------------- | ------------------------------------ |
| Âge adulte | 30  | Chargé de mission | 12 000 € | 8           | 12            | Premier collaborateur, tableau de bord |
| Maturité   | 50  | Directeur adjoint | 480 000 € | 16        | 21            | Travail automatique actif, logement premium |
| Vieillesse | 65  | Directeur adjoint | 2,48 M€ | 30           | 26            | Senior (actions manuelles à moitié), 10 ans devant soi |

Un état de départ liste l'emploi, l'argent, le stock, la réputation, les stats,
les entreprises, les améliorations (dans l'ordre d'achat), les quartiers, les
entrepôts et les placements. Le loyer, les salaires, la capacité du stock et le
logement ne s'écrivent pas : ils **découlent des améliorations**
(`withModifiers`).

Règles du départ (`sliceGame`, `src/game/lifeSlices/sliceStart.ts`) :

- **Le temps reste continu.** Le personnage a eu 18 ans en janvier 1999 ; on
  avance le compteur de périodes au lieu de changer l'âge de départ. À 30 ans, on
  est en janvier 2011, ce qui garde dates et événements du monde cohérents.
- **Les événements passés sont réputés avoir eu lieu.** Les événements uniques
  déjà déclenchés à cet âge sont marqués comme tels, sans effet ni courrier : ils
  ne surviennent pas tous d'un coup.
- **L'anniversaire du départ** s'affiche quand il en existe un (30 et 50 ans) ;
  à 65 ans il n'y en a pas, il est fêté sans fenêtre (une ligne « 65 ans » au
  courrier, déjà lue).
- **Les nouveautés sont vues** : pas de pastilles sur tous les onglets.

Mesures du simulateur, joueur virtuel parti de chaque état (jeu actif, attente
des automatismes) : Jeunesse 31 min + 15 min, âge adulte 20 min + 13 min,
maturité 4 min + 9 min, vieillesse 3 min + 2 min. Les deux dernières tranches
sont courtes : elles serviront surtout à tester la fin de partie. Les valeurs ne
sont pas équilibrées pour cet usage, elles seront revues tranche par tranche.

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

- Aucune règle propre aux tranches d’avant 18 ans (stats, lieux, durée) : elles
  viendront une à une.
  La petite enfance a une proposition : [petite-enfance.md](petite-enfance.md).
- Aucun équilibrage propre aux départs en cours de vie.
- Pas de passage automatique d'une tranche à la suivante.
- Pas de modèle d'état commun refondu : `GameState` porte la tranche
  (`lifeSlice`) et le compteur (`growth`), le reste est celui de Jeunesse. On
  refactorisera quand on enchaînera les tranches ([ADR 0012](../../.claude/adr/0012-tranches-de-vie.md)).
