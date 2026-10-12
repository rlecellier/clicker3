# Onglet Investir

[Sommaire](README.md) · Raccourci : touche 5 · Précédent : [Emploi](onglet-emploi.md) · Suite : [Comptes](onglet-comptes.md)

C'est là que l'argent (et la réputation) se dépense. L'onglet est découpé en
quatre sous-onglets, sous une barre d'entrepôt. Une pastille de nouveautés
compte ce qui vient de se débloquer.

## La barre d'entrepôt

En haut : « Entrepôt : vide (0 / 50) ». Le mot change avec la situation.

| Mot         | Sens                                                                       |
| ----------- | -------------------------------------------------------------------------- |
| vide        | Aucun article en stock                                                     |
| en cours    | Du stock, mais de la place                                                 |
| plein       | Le stock a atteint la capacité de l'entrepôt                               |
| en rupture  | Le dernier mois, un commerce n'a pas pu vendre toute sa capacité          |

Voir [Les entreprises](entreprises.md) pour la mécanique du stock.

## Comment se lisent les lignes

Toutes les lignes suivent le même modèle :

- le nom, éventuellement suivi d'un repère (« 2 possédé(s) » ou « Ouvert ») ;
- le détail et le **prix**, avec le loyer ou les salaires ajoutés si
  l'achat en implique ;
- les **conditions** manquantes, une par ligne : ✔ en vert quand elles sont
  remplies, ✘ en rouge sinon, avec votre avancement (« ✘ Palier Gestion 1 :
  0 / 2 pts ») ;
- le bouton d'action, grisé quand l'achat est impossible, avec la raison :
  « Argent insuffisant », « Réputation insuffisante » ou « Partie terminée ».

**Toutes les valeurs affichées sont les valeurs réelles**, bonus compris, pas des
valeurs de base. Si vous avez acheté la Camionnette d'occasion, l'Atelier
d'assemblage annonce 2,3 articles par exemplaire au lieu de 2.

## Entreprises

La liste des six types d'entreprises, plus le **Petit entrepôt**. Chaque
ligne dit ce que fait l'entreprise et le prix du prochain exemplaire :

- avant d'en posséder : « Produit 2 articles par période et par exemplaire » ;
- après : « Produit 6 articles par période (3 × 2) », ce qui indique le total
  réel, bonus compris ;
- un commerce ajoute son prix de vente final : « Vend jusqu'à 3 articles par
  période et par exemplaire à 12 € ».

Si une production de plus dépasserait ce que votre entrepôt peut contenir, le
jeu refuse l'achat tant qu'une amélioration d'entrepôt reste à acheter :
« Entrepôt trop petit : agrandissez-le d'abord ».

Chaque achat est immédiat. Détail de chaque type dans
[Les entreprises](entreprises.md).

## Améliorations

La liste des achats uniques que vous pouvez faire. Elle montre toutes celles
dont les conditions sont remplies, de la moins chère à la plus chère, puis **la
moins chère de celles qui sont encore verrouillées**, pour vous montrer la suite.

Chaque amélioration affiche :

- son **effet chiffré**, en une ou plusieurs lignes : par exemple « Production de
  toutes les entreprises +110 % » ou « Capacité du stock ×13 » ;
- si elle change la production, un avant-après calculé sur votre situation
  actuelle : « Production : 4 → 8 articles par période » ;
- sa phrase d'humour, son prix, et le loyer ou les salaires qu'elle ajoute ;
- ses conditions manquantes.

Le guide détaille chaque amélioration dans [Les améliorations](ameliorations.md).
Quand le lien « Prochain achat » de la Vie vous amène ici, la ligne visée est
entourée quelques secondes et l'écran défile jusqu'à elle.

## Quartiers (réputation)

Les quatre quartiers de la ville, avec leur description et leur prix **en
réputation**. Les Tilleuls sont ouverts dès le départ. Les trois autres
demandent un palier de réputation, et leur prix est dépensé du solde disponible.
Les quartiers se débloquent aussi depuis l'onglet [Ville](onglet-ville.md).

| Quartier                    | Prix | Condition                                      |
| --------------------------- | ---- | ---------------------------------------------- |
| Les Tilleuls                | 0    | Ouvert au départ                               |
| Les Hauts-Fourneaux         | 1    | Palier 1 de réputation (6 gagnés)              |
| Parc d'activités Horizon    | 22   | Palier 2 de réputation (100 gagnés)            |
| Le Pôle d'Excellence        | 33   | Palier 3 de réputation (170 gagnés)            |

## Obtenues

La liste de vos améliorations, dans l'ordre d'achat, avec leur effet. Chacune
porte un bouton **Annuler**.

- Annuler **retire** l'effet, le loyer et les salaires de l'amélioration.
- Annuler **ne rend pas** l'argent dépensé.
- Il n'y a pas de confirmation : le bouton agit tout de suite.
- Vous pouvez racheter l'amélioration au prix d'origine, si ses conditions sont
  toujours remplies.
- Vous ne reviendrez pas à une phase de vie inférieure : la phase atteinte est
  définitive.

Tant que rien n'est acheté : « Aucune amélioration obtenue pour le moment. »
Quand il ne reste rien à acheter : « Plus rien à acheter pour le moment. »
