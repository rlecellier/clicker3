# Lire les comptes

[Sommaire](README.md) · Précédent : [Les événements](evenements.md) · Suite : [Raccourcis clavier et mobile](raccourcis-et-mobile.md)

Cette page explique, ligne par ligne, ce que dit l'onglet [Comptes](onglet-comptes.md)
une fois le **Tableau de bord** acheté (5 200 €). Sans lui, vous ne voyez que
Recettes, Dépenses et Solde.

## Le principe

- On lit **une période à la fois** : la période en cours, l'une des trois
  précédentes, ou le cumul depuis le début de la vie.
- Une période est un mois. Les montants d'une ligne sont ceux de ce mois-là.
- Chaque tableau d'argent a une colonne « Part » : le poids de la ligne dans le
  total des recettes ou des dépenses (en %). Les lignes précédées d'un point
  (« · Boutique ») détaillent la ligne du dessus.
- Un rapide coup d'œil à la ligne « Solde » dit si le mois est bon ou mauvais.

## D'où vient l'argent ?

| Ligne                         | Ce qu'elle compte                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Salaires                      | L'argent gagné en travaillant à un poste, avec une ligne par poste occupé (« · Manutentionnaire intérimaire ») |
| Ventes des commerces          | L'argent des ventes de fin de mois, avec une ligne par commerce (« · Boutique »)                |
| Vente du surplus              | L'argent du bouton « Vendre le surplus »                                                        |
| Rendement des placements      | Ce que les [placements](onglet-finance.md) ont versé sur le compte courant. Ne s'affiche que si le montant n'est pas nul |
| Autres recettes               | Gains d'événements. Ne s'affiche que si le montant n'est pas nul                                |
| Total des recettes            | La somme des lignes ci-dessus                                                                   |
| Solde (recettes moins dépenses) | Total des recettes moins total des dépenses. Négatif, il signale un mois déficitaire          |

Une remarque sur les ventes : les commerces vendent tout le stock, production
du mois comprise, dans la limite de leur capacité (voir
[Les entreprises](entreprises.md)).

## Où part l'argent ?

| Ligne                | Ce qu'elle compte                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Loyer                | Le loyer prélevé à la fin du mois, logements achetés compris                                       |
| Train de vie         | Courses, transport, téléphone : 470 € au studio de départ, plus cher avec chaque logement           |
| Charges des entreprises | Les mensualités du crédit de chaque entreprise possédée, prélevées à la fin du mois |
| Salaires versés      | Les salaires de vos employés, prélevés à la fin du mois (à ne pas confondre avec vos propres « Salaires » en recettes) |
| Intérêts             | Les 1,5 % prélevés sur une dette (argent négatif)                                                    |
| Achats               | Ce que vous avez payé pour des entreprises, des petits entrepôts et des améliorations, avec une ligne par achat (« · Entrepôt » pour les petits entrepôts) |
| Études               | L'argent des séances d'étude, avec une ligne par cursus                                            |
| Autres dépenses      | Dépenses d'événements (un mois de loyer en décembre 1999, 10 % de l'argent en 2008). Ne s'affiche que si le montant n'est pas nul |
| Total des dépenses   | La somme des lignes ci-dessus                                                                      |

## Comment le stock a-t-il bougé ?

| Ligne                       | Ce qu'elle compte                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Stock au début              | Le stock au premier instant de la période                                               |
| Entrées (production)        | Les articles produits pendant la période, avec une ligne par production                 |
| Sorties (ventes)            | Les articles vendus, avec une ligne par commerce, plus « · Vente du surplus »            |
| Perdu (entrepôt plein)      | Les articles jetés faute de place, après les ventes                                     |
| Stock actuel / capacité     | Pour la période en cours : le stock d'aujourd'hui et la capacité de l'entrepôt         |
| Stock à la fin              | Pour une période terminée : le stock à son terme                                        |

Le compte est bon quand **début + entrées − sorties − perdu = fin**. La ligne
« Stock au début » ne s'affiche pas quand elle n'est pas connue (par exemple pour
le cumul).

## Ce que rapporte chaque entreprise

Un tableau à trois colonnes.

| Colonne      | Sens                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| Entreprise   | Chaque type d'entreprise que vous possédez                                                    |
| Rapporte     | Pour un commerce : l'argent de ses ventes de la période. Pour une production : un tiret, car elle ne rapporte rien en direct |
| Articles     | Pour une production : « N fournis ». Pour un commerce : « N vendus »                          |

## Et la réputation ?

| Ligne                 | Ce qu'elle compte                                                          |
| --------------------- | -------------------------------------------------------------------------- |
| Réputation gagnée     | Gagnée en travaillant et en vendant                                        |
| Réputation perdue     | Perdue en rupture de stock, en impayé et au krach                          |
| Réputation dépensée   | Dépensée pour prendre un poste ou ouvrir un quartier                       |

## Un exemple

Un mois où vous travaillez six fois à l'intérim (trois actions à 320 €, puis
deux heures supplémentaires à 400 € et une à 432 €, la jauge étant pleine),
avec deux ateliers d'assemblage et une boutique, dans le studio de départ :

- Recettes : « Salaires » 2 192 €, « Ventes des commerces » 36 € (3 articles à
  12 €), total 2 228 €.
- Dépenses : « Loyer » 300 €, « Train de vie » 470 €, total 770 €.
- Stock : début 0, entrées 4, sorties 3, perdu 0, fin 1.
- Solde : +1 458 €.

## Quand « Détail indisponible » apparaît

Une sauvegarde de la version 1 n'a pas gardé le détail des mois passés. Pour ces
mois, un seul total s'affiche, avec la mention « Détail indisponible pour cette
période ». Voir [La version 1.5](la-version-1-5.md#vos-sauvegardes-de-la-version-1).
