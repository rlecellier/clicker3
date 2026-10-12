# Les entreprises

[Sommaire](README.md) · Précédent : [Les autres sources de bonus](autres-bonus.md) · Suite : [Les systèmes](systemes.md)

Les entreprises sont le moteur du jeu : l'argent ne vient plus seulement de vos
mains, mais de ce qui tourne sans vous. Elles s'achètent dans
[Investir](onglet-investir.md), sous-onglet Entreprises.

## Deux familles, une seule marchandise

Il n'existe qu'un type de marchandise : **l'article**. Des entreprises le
**produisent**, d'autres le **vendent**. Une production ne rapporte rien par elle-même ;
un commerce ne vend rien sans stock. Il faut donc les deux, en proportion.

| Entreprise                    | Famille    | Articles par mois et par exemplaire | Prix de vente | Prix du 1ᵉʳ exemplaire | Conditions                                                                 |
| ----------------------------- | ---------- | ----------------------------------- | ------------- | ---------------------- | -------------------------------------------------------------------------- |
| Atelier d'assemblage          | Production | produit 2                           |               | 150 €                  | Gestion 1                                                                  |
| Boutique                      | Commerce   | vend jusqu'à 3                      | 12 €          | 250 €                  | Gestion 1                                                                  |
| Manufacture                   | Production | produit 99                          |               | 13 000 €               | Gestion 2                                                                  |
| Hypermarché                   | Commerce   | vend jusqu'à 87                     | 13 €          | 13 000 €               | Gestion 2 et quartier Parc d'activités Horizon ouvert                      |
| Site de production délocalisé | Production | produit 210                         |               | 53 000 €               | Gestion 3                                                                  |
| Plateforme en ligne           | Commerce   | vend jusqu'à 250                    | 15 €          | 66 000 €               | Gestion 3, à partir de janvier 2000 et quartier Pôle d'Excellence ouvert   |

Les paliers de Gestion sont à 2, 9 et 41 points. Les bonus des
[améliorations](ameliorations.md#comment-les-bonus-se-combinent) multiplient les
articles produits et les prix de vente ; Investir montre toujours les valeurs
finales.

## Le prix augmente avec chaque exemplaire

Chaque exemplaire coûte 10 % de plus que le précédent, arrondi à l'euro.

| Entreprise                    | 1ᵉʳ        | 2ᵉ         | 3ᵉ         |
| ----------------------------- | ---------- | ---------- | ---------- |
| Atelier d'assemblage          | 150 €      | 165 €      | 182 €      |
| Boutique                      | 250 €      | 275 €      | 303 €      |
| Manufacture                   | 13 000 €   | 14 300 €   | 15 730 €   |
| Hypermarché                   | 13 000 €   | 14 300 €   | 15 730 €   |
| Site de production délocalisé | 53 000 €   | 58 300 €   | 64 130 €   |
| Plateforme en ligne           | 66 000 €   | 72 600 €   | 79 860 €   |

Vos entreprises ne travaillent que lorsqu'un mois se termine. Dans cette
version, le personnage ne peut pas « travailler dans » une entreprise : il
travaille toujours à son poste.

## Ce qui se passe à la fin de chaque mois

1. **Production.** Chaque production verse ses articles dans le stock, sans
   limite à ce stade : rien n'est perdu.
2. **Ventes.** Les commerces vendent, dans l'ordre Boutique, Hypermarché, Plateforme.
   Chacun vend le plus petit de ces deux nombres : sa capacité de vente ou
   le stock restant, **production du mois comprise**. L'argent arrive à ce moment : articles
   vendus × prix × coefficient de vente.
3. **Rangement.** Le stock qui reste est rangé dans l'entrepôt. Ce qui dépasse
   sa capacité est **perdu**.
4. Ensuite viennent le loyer, les salaires, les intérêts de la dette et le
   vieillissement (voir [Débuter](debuter.md#la-jauge-de-temps)).

### La réputation des ventes

- Chaque article vendu rapporte 0,02 de réputation (0,03 avec le Plan de
  communication).
- Un commerce qui n'a pas pu vendre toute sa capacité est « en rupture » :
  il fait **perdre 0,5 de réputation**, une fois par commerce en rupture et par
  mois. La réputation ne descend jamais sous 0.
- Un commerce acheté sans production derrière est donc en rupture chaque mois.
  Exemple : un atelier produit 2 articles, une boutique peut en vendre 3 : elle est en
  rupture. Deux ateliers (4 articles) suffisent pour une boutique.

Le message « Vos clients découvrent la rareté. Ils ne vous en sont pas
reconnaissants. » signale une rupture ; « Votre entrepôt déborde. La production
continue, par principe. » signale du stock perdu.

## L'entrepôt

L'entrepôt contient **50 articles** au départ. Trois moyens de l'agrandir :

| Moyen                  | Effet                                  | Prix                                         |
| ---------------------- | -------------------------------------- | -------------------------------------------- |
| Étagères en kit        | Capacité ×13                           | 2 900 € (Gestion 1)                          |
| Entrepôt logistique    | Capacité ×48                           | 31 000 € (Gestion 3)                         |
| Petit entrepôt         | +25 de capacité, achetable sans limite | 100 €, puis +15 % chacun (100, 115, 132, 152…) |

Les petits entrepôts n'ont aucune condition : c'est l'issue de secours quand la
production dépasse la place disponible.

Une garde protège le débutant : tant qu'une amélioration d'entrepôt reste à
acheter, le jeu refuse d'acheter une entreprise de production dont la production
mensuelle dépasserait la capacité. L'achat reste grisé avec la raison « Entrepôt
trop petit : agrandissez-le d'abord ». Quand il ne reste plus d'amélioration
d'entrepôt, la garde tombe : on peut alors jeter du stock.

## Le surplus

Le bouton « Vendre le surplus » (onglet Vie) vend **tout le stock** d'un coup à
4 € l'article, sans passer par les commerces, et remplit 5 sur la jauge de 70.

- Il évite de laisser dormir des articles quand on produit sans encore pouvoir
  vendre.
- Il est bien moins rentable qu'un commerce (12 à 15 € l'article), et le bonus
  de vente ne s'y applique pas.
- Il apparaît dans les [Comptes](lire-les-comptes.md) sous « Vente du surplus ».

## Où se trouvent les entreprises

Chaque entreprise a son bâtiment sur le plan de la [Ville](onglet-ville.md),
dans son quartier. Voir aussi [Les systèmes](systemes.md#les-quartiers).
