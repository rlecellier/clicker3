# Les entreprises

[Sommaire](README.md) · Précédent : [Les autres sources de bonus](autres-bonus.md) · Suite : [Les systèmes](systemes.md)

Les entreprises sont le moteur du jeu : l'argent ne vient plus seulement de vos
mains, mais de ce qui tourne sans vous. Elles s'achètent dans
[Investir](onglet-investir.md), sous-onglet Entreprises.

## Deux familles, une seule marchandise

Il n'existe qu'un type de marchandise : **l'article**. Des entreprises le
**produisent**, d'autres le **vendent**. Une production ne rapporte rien par elle-même ;
un commerce ne vend rien sans stock. Il faut donc les deux, en proportion.

Deux **micro-activités** ouvrent la voie (un établi au garage, un stand au
marché), puis les vraies entreprises, à l'échelle de 1999.

| Entreprise                    | Famille    | Articles par mois et par exemplaire | Prix de vente | Apport du 1ᵉʳ exemplaire | Charges par mois | Plafond | Conditions                                                                 |
| ----------------------------- | ---------- | ----------------------------------- | ------------- | ------------------------ | ---------------- | ------- | -------------------------------------------------------------------------- |
| Établi au garage              | Production | produit 10                          |               | 800 €                    |                  | 3       | Gestion 1                                                                  |
| Stand au marché               | Commerce   | vend jusqu'à 29                     | 12 €          | 1 400 €                  | 100 €            | 4       | Gestion 1                                                                  |
| Atelier d'assemblage          | Production | produit 170                         |               | 16 000 €                 | 234 €            | 4       | Gestion 2                                                                  |
| Boutique                      | Commerce   | vend jusqu'à 110                    | 13 €          | 28 000 €                 | 409 €            | 4       | Gestion 2                                                                  |
| Manufacture                   | Production | produit 930                         |               | 890 000 €                | 12 994 €         | 6       | Gestion 4                                                                  |
| Corner en hypermarché         | Commerce   | vend jusqu'à 470                    | 12 €          | 380 000 €                | 5 548 €          | 8       | Gestion 5 et quartier Parc d'activités Horizon ouvert                      |
| Site de production délocalisé | Production | produit 4 000                       |               | 6 200 000 €              | 90 520 €         | 2       | Gestion 6                                                                  |
| Plateforme en ligne           | Commerce   | vend jusqu'à 9 600                  | 15 €          | 8 400 000 €              | 122 640 €        | 4       | Gestion 7, à partir de janvier 2000 et quartier Pôle d'Excellence ouvert   |

Les paliers de Gestion sont à 2, 6, 15, 35, 80, 170, 350 et 700 points. Les bonus
des [améliorations](ameliorations.md#comment-les-bonus-se-combinent) multiplient les
articles produits et les prix de vente ; Investir montre toujours les valeurs
finales.

## Apport, charges et plafond

- **Le prix affiché est l'apport.** On n'achète pas une boutique comptant : on
  verse un apport et on emprunte le reste. Dans le jeu, le prix de l'exemplaire
  est cet apport.
- **Les charges sont la mensualité du crédit.** Chaque exemplaire possédé
  ajoute ses charges (environ 1,46 % de l'apport par mois, un crédit du même
  montant à 6 % sur sept ans) aux dépenses de chaque mois, qu'il vende ou non.
  Elles apparaissent dans les [Comptes](lire-les-comptes.md) sous « Charges des
  entreprises ». Les micro-activités se paient comptant (un petit droit de
  place pour le stand).
- **Chaque type a un plafond d'exemplaires** dans son quartier. Une fois
  atteint, le bouton Acheter reste grisé (« Quartier complet : montez en
  gamme »). Après le plafond, la croissance passe par la
  [montée en gamme](ameliorations.md#la-montée-en-gamme).
- **Le prix augmente avec chaque exemplaire**, jamais au-delà de 10 fois le prix
  du premier :

| Entreprise                    | Hausse par exemplaire | 1ᵉʳ        | Dernier (plafond) |
| ----------------------------- | --------------------- | ---------- | ----------------- |
| Établi au garage              | +64 %                 | 800 €      | 2 152 €           |
| Stand au marché               | +57 %                 | 1 400 €    | 5 418 €           |
| Atelier d'assemblage          | +61 %                 | 16 000 €   | 66 772 €          |
| Boutique                      | +99 %                 | 28 000 €   | 220 657 €         |
| Manufacture                   | +33 %                 | 890 000 €  | 3 703 806 €       |
| Corner en hypermarché         | +32 %                 | 380 000 €  | 2 653 390 €       |
| Site de production délocalisé | +130 %                | 6 200 000 € | 14 260 000 €     |
| Plateforme en ligne           | +23 %                 | 8 400 000 € | 15 631 283 €     |

Au total, les plafonds laissent 35 places, et une vie les remplit toutes : une
trentaine d'établissements, et non des centaines.

Vos entreprises ne travaillent que lorsqu'un mois se termine. Dans cette
version, le personnage ne peut pas « travailler dans » une entreprise : il
travaille toujours à son poste.

## Ce qui se passe à la fin de chaque mois

1. **Production.** Chaque production verse ses articles dans le stock, sans
   limite à ce stade : rien n'est perdu.
2. **Ventes.** Les commerces vendent, dans l'ordre Stand, Boutique, Corner,
   Plateforme. Chacun vend le plus petit de ces deux nombres : sa capacité de
   vente ou le stock restant, **production du mois comprise**. L'argent arrive à
   ce moment : articles vendus × prix × coefficient de vente.
3. **Rangement.** Le stock qui reste est rangé dans l'entrepôt. Ce qui dépasse
   sa capacité est **perdu**.
4. Ensuite viennent le loyer, le train de vie, les **charges des entreprises**,
   les salaires, les intérêts de la dette (1,5 % par mois) et le vieillissement
   (voir [Débuter](debuter.md#la-jauge-de-temps)).

### La réputation des ventes

- Chaque article vendu rapporte 0,02 de réputation (0,03 avec le Plan de
  communication).
- Un commerce qui n'a pas pu vendre toute sa capacité est « en rupture » :
  il fait **perdre 0,5 de réputation**, une fois par commerce en rupture et par
  mois. La réputation ne descend jamais sous 0.
- Un commerce acheté sans production derrière est donc en rupture chaque mois.
  Exemple : un atelier produit 170 articles, une boutique peut en vendre 110 :
  tout part. Deux boutiques (220) dépassent un atelier et sont en rupture.

Le message « Vos clients découvrent la rareté. Ils ne vous en sont pas
reconnaissants. » signale une rupture ; « Votre entrepôt déborde. La production
continue, par principe. » signale du stock perdu.

## L'entrepôt

L'entrepôt contient **50 articles** au départ. Trois moyens de l'agrandir :

| Moyen                  | Effet                                  | Prix                                         |
| ---------------------- | -------------------------------------- | -------------------------------------------- |
| Étagères en kit        | Capacité ×120                          | 13 000 € (Gestion 3)                         |
| Entrepôt logistique    | Capacité ×18                           | 34 000 € (Gestion 6)                         |
| Petit entrepôt         | +35 de capacité, multipliés par les agrandissements (×120, ×18), achetable sans limite | 160 €, puis +3 % chacun (160, 165, 170…) |

Les petits entrepôts n'ont aucune condition : c'est l'issue de secours quand la
production dépasse la place disponible. Les agrandissements multiplient toute la
capacité, petits entrepôts compris, qu'ils aient été achetés avant ou après :
l'ordre des achats ne change rien. L'écran Investir affiche ce qu'un petit
entrepôt apporte vraiment.

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
