# Placements et comptes

> Statut : **décidé, en cours de réalisation (issues #211, v1.6, et #230 pour la répartition automatique)**. Les
> questions ouvertes sont tranchées ci-dessous ; rendements et plafonds sont calés
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

1. **Périmètre** : compte courant, Livret A, PEL, compte-titres. L'immobilier
   locatif attend la v3, l'héritage la v2.
2. **Rendement fixe, sans hasard** : une échelle française, par mois :
   Livret A 0,1 % (~1,2 % par an), PEL 0,3 % (~3,6 %), compte-titres 0,8 %
   (~10 %). Les événements (bulle +1,2 point, krach et crise financière
   −3 points pendant un an) ne touchent que les titres. Un rendement négatif
   retire du capital placé, donc du solde total (noté en « autres dépenses »).
3. **Plafond de capital par placement**, proportionnel à la réputation gagnée
   (Livret A 100 € par point, PEL 200 €, titres 300 €), donc il suit la
   richesse. Déblocage aux paliers de réputation 1, 2 et 3. Ni frais ni
   fiscalité.
4. **Répartition automatique (#230)** : pas de geste de dépôt ni de retrait.
   `money` est le **total de tous les comptes** (c'est ce que le joueur voit) ;
   la séparation ne sert qu'à savoir quelle part du capital rapporte. Le
   compte courant garde un matelas de **2 × les dépenses fixes** d'une période ;
   le surplus va dans le premier compte (par rendement croissant) qui a de la
   place. Une dépense puise d'abord dans le compte courant, puis dans le compte
   au rendement le plus faible. Un revenu remplit le compte courant avant tout.
5. **UI** : onglet Finance (touche 8), en lecture seule : total, compte
   courant et matelas, capital placé, un compte par ligne.
6. **Hors-ligne** : le rendement s'applique aux périodes simulées en l'absence.

Mécanique : le rendement d'un gain est **versé sur le compte courant** à la
clôture, puis la répartition le place s'il dépasse le matelas (il se capitalise
donc). Un impayé n'existe que si le total de tous les comptes ne couvre pas les
dépenses. Le capital est compris dans `money` ; le bilan de fin de vie le
montre en « dont capital placé ».

## Calibrage

Mesuré au simulateur (voir [equilibrage.md](equilibrage.md#placements-issue-211)) :
le rendement maximal pèse 1 à 10 % des recettes, un revenu d'appoint. Le
basculement « rentier » (le capital rapporte plus que les entreprises) n'est pas
visé en v1.6 : à trancher avec le backlog.

## Reste à faire

- Annoncer les variations de rendement par pop-up : suivi par l'issue #209
  (pour l'instant, courrier et journal comme les autres événements).
