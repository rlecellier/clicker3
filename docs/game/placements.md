# Placements et comptes

> Statut : **décidé, en cours de réalisation (issue #211, v1.6)**. Les
> questions ouvertes sont tranchées ci-dessous ; les rendements restent à caler
> au simulateur. Périmètre v1 : [v1.md](v1.md).

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

## Décisions (v1.6)

1. **Périmètre** : compte courant, compte épargne, compte titres. L'immobilier
   locatif attend la v3, l'héritage la v2.
2. **Rendement fixe, sans hasard** : épargne 0,3 % par mois, titres 0,8 % ;
   les événements (bulle +1,2 point, krach et crise financière −3 points
   pendant un an) ne touchent que les titres. Un rendement négatif retire du
   capital placé. S'il faut du hasard, on réintroduit une graine dans l'état.
3. **Plafond de capital par placement**, qui monte avec les paliers de
   réputation (épargne 5 000 / 20 000 / 80 000 €, titres 20 000 / 150 000 €).
   Ni frais ni fiscalité.
4. **UI** : onglet Finance (touche 8), avec des gestes explicites (placer tout,
   la moitié, retirer tout), pas de curseurs.
5. **Hors-ligne** : le rendement s'applique aux périodes simulées en l'absence.

Mécanique : le rendement d'un gain est **versé sur le compte courant** à la
clôture (il ne se capitalise pas) ; si l'argent ne couvre pas les dépenses
fixes, les placements sont repris avant l'impayé (épargne d'abord). Le capital
n'entre pas dans `money`, ni dans le bilan de fin de vie.

## Reste à faire

- Caler plafonds et rendements au simulateur (`docs/game/equilibrage.md`) : en
  fin de partie l'argent se compte en millions, les plafonds actuels
  (réalisme 1999) pèsent très peu face aux entreprises ; le basculement
  « rentier » n'est donc pas encore atteint.
- Annoncer les variations de rendement par pop-up (#209) ; elles passent pour
  l'instant par le courrier et le journal comme les autres événements.
- Compter le capital placé dans le bilan de fin de vie.
