# Notre clicker

Toute la documentation du jeu lui-même (thème, mécaniques, équilibrage) vit ici.
La recherche générale sur le genre est dans [`../game-design/`](../game-design/README.md) ;
la stack dans [`../stack.md`](../stack.md).

## Documents

| Document                                       | Contenu                                                  |
| ---------------------------------------------- | -------------------------------------------------------- |
| [concept.md](concept.md)                       | La vie d'un personnage : pitch, décisions, risques       |
| [v1.md](v1.md)                                 | Périmètre exact de la v1 : temps, actions, sommeil, économie, stock |
| [simulateur.md](simulateur.md)                 | Simulateur de vie : méthode, mesures, dernier relevé    |
| [equilibrage.md](equilibrage.md)               | Valeurs retenues, leur justification et la preuve au simulateur |
| [propositions-equilibrage.md](propositions-equilibrage.md) | Propositions à trancher : chiffres crédibles, stats longues, boosts utiles |
| [backlog.md](backlog.md)                       | Idées triées et tranches pour les itérations suivantes   |
| [ameliorations-et-evenements.md](ameliorations-et-evenements.md) | Les ~20 améliorations et les événements de la v1 (décidé) |
| [placements.md](placements.md)                 | Piste v2 / v3 : comptes et placements qui rapportent plus que les entreprises |
| [ton-et-univers.md](ton-et-univers.md)         | Ton, époque, ville, quartiers, personnage, visuel : décidés |
| [indicateurs-impact.md](indicateurs-impact.md) | Indicateurs d'impact sur la ville : pollution et inégalités (décidé) |

## Les 8 questions à trancher avant de coder

Reprises de la [section 8 de la recherche](../game-design/README.md#8-questions-à-trancher-pour-la-suite).

| #   | Question                                   | Statut    | Décision                                                                                  |
| --- | ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------- |
| 1   | Thème et ton                               | **décidé** | La vie d'un personnage dans une ville inventée ([concept.md](concept.md)) ; ton 50/50 réaliste-satirique-absurde, contre tout le système, fin froide ([ton-et-univers.md](ton-et-univers.md)) |
| 2   | Ressource principale et secondaires        | **décidé** | Argent + une marchandise (stock) + réputation ([v1.md](v1.md#5-économie)) |
| 3   | Générateurs et améliorations               | **décidé** | 4 emplois, 4 à 6 entreprises, ~20 améliorations ; croissance des coûts 1,07–1,15 ([v1.md](v1.md#5-économie)) |
| 4   | Rôle du clic après l'automatisation        | **décidé** | **Boost actif** : une action automatique rapporte 2× moins qu'une manuelle ; l'auto simule deux clics par seconde ([ADR 0005](../../.claude/adr/0005-rythme-de-l-automatisation.md)) |
| 5   | Prestige                                   | **décidé** | **Pas de prestige en v1** : une seule vie. Plus tard, le changement de vie (mort) transmettra argent, statut, compétences ou idéologie — à trancher alors |
| 6   | Hors-ligne                                 | **décidé** | Pas de limite ; actions automatiques activables, mort possible pendant l'absence ([v1.md](v1.md#6-automatisation-et-absence)) |
| 7   | Choix de design (plus qu'un compteur)      | **décidé** | Chaque action fait avancer le temps ; produire ou vendre ; stats qui débloquent ; phases de vie ([v1.md](v1.md#2-les-actions)) |
| 8   | Taille de la v1                            | **décidé** | **Petite** : une vie complète, 30 à 60 min de jeu actif, à valider en playtest |

## Conséquences des décisions

- Sans prestige, la fin de la v1 est la **mort du personnage** ; la progression
  doit rester lisible jusque-là : il faut des phases de vie, des paliers de
  multiplicateurs et des objectifs visibles pour éviter les zones mortes
  (voir [pièges courants](../game-design/README.md#6-pièges-courants)).
- Le temps vient de l'état (périodes, jauge), jamais de `Date.now()` dans les
  règles.
- Le hors-ligne est calculé à l'ouverture depuis l'horodatage sauvegardé, en
  rejouant les actions automatiques.
- Le temps du jeu avance par une jauge remplie par les actions ; la production
  des entreprises est versée en fin de période.
