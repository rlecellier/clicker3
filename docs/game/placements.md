# Placements et comptes (piste v2 / v3)

> Statut : **idée**, hors v1. Rien n'est décidé ni chiffré ; ce document garde
> la piste pour ne pas la perdre. Périmètre v1 : [v1.md](v1.md).

## Constat

Dans la vie, personne ne garde 7 ou 100 millions en espèces ni sur son compte
courant. En v1, tout l'argent est un seul solde qui dort. Plus le joueur
avance, plus ce solde est absurde (et plus l'onglet Finance est vide).

## Idée

L'argent peut être **réparti entre des comptes et des placements**, chacun avec
un rendement. Plus on avance, plus on en débloque.

| Placement               | Rôle                                   | Rendement / risque (à calibrer)        |
| ----------------------- | -------------------------------------- | -------------------------------------- |
| Compte courant          | Là où tombent revenus et dépenses      | Aucun                                  |
| Compte épargne          | Sûr, liquide                           | Faible, stable                         |
| Compte titres (actions) | Rend plus, bouge avec les événements   | Moyen, variable (krach, bulle)         |
| Immobilier locatif      | Loyers réguliers, ticket d'entrée haut | Moyen, lent à acheter / revendre       |

## Règles de principe

- **Aucun blocage d'argent** : on peut toujours dépenser un placement. Seule
  contrainte possible plus tard : un délai ou des frais de retrait sur les
  placements risqués ou immobiliers (à trancher, pas en première version).
- **Le rendement s'ajoute à la période** : à chaque période (un mois), chaque
  placement verse son rendement dans l'étape de calcul existante (v1.md § 1),
  sans hasard tant que la mécanique n'en demande pas (règles pures, testables ; s'il en faut un, on réintroduit une graine dans l'état).
- **Déblocage progressif** par paliers (stats, réputation, capital), comme les
  autres achats : on ne propose pas un compte titres à 18 ans.
- **Les événements existants servent** : bulle internet, crise financière
  ([ameliorations-et-evenements.md](ameliorations-et-evenements.md)) touchent
  les placements actions et immobilier. Un événement qui modifie un
  rendement s'annonce par une **pop-up**, comme les autres événements à effet
  ([présentation](ameliorations-et-evenements.md#présentation--pop-up-ou-courrier)).
- **Le ton reste satirique** : produits aux noms managériaux, « épargne
  optimisée » ([ton-et-univers.md](ton-et-univers.md)).

## Effet sur l'équilibre : le basculement

Au départ, les entreprises rapportent le plus. À un moment, le **capital placé
rapporte plus que le travail et les entreprises** : c'est un changement de
phase de la partie (le joueur devient rentier). Conséquences à étudier :

- les entreprises deviennent un moyen de constituer du capital, pas une fin ;
- cela rejoint l'écart pauvre / riche des indicateurs
  ([indicateurs-impact.md](indicateurs-impact.md)) : le capital s'accumule
  chez ceux qui en ont déjà, et peut nourrir le propos satirique ;
- en plusieurs vies (v2), les placements sont l'un des candidats à
  **l'héritage** (voir [backlog.md](backlog.md#origines-pauvre--riche)).

## Questions ouvertes

1. Les placements entrent-ils en v2 (avec l'héritage) ou en v3 (ville vivante) ?
2. Rendement garanti ou aléatoire ? Un seul niveau de risque pour commencer ?
3. Faut-il des frais, un plafond ou une fiscalité pour éviter qu'un placement
   domine tout dès qu'il est débloqué ?
4. Où vit l'UI : l'onglet Finance existant, avec une répartition en
   curseurs ou en achats ?
5. Hors-ligne : le rendement s'applique-t-il aux périodes simulées en
   l'absence du joueur (probablement oui, c'est le principe d'un placement) ?
