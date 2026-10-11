# Backlog du jeu

Toutes les idées, triées, pour itérer après la v1. Le périmètre exact de la v1
est dans [v1.md](v1.md).

Verdict : **v1** (dans [v1.md](v1.md)), **v2** (après une v1 amusante),
**plus tard** (gros chantier), **à trancher**.
Coût : S/M/L = effort de développement estimé, intérêt : ★ à ★★★.

## Boucle de base

| Idée                                                  | Coût | Intérêt | Verdict |
| ----------------------------------------------------- | ---- | ------- | ------- |
| Travailler (clic) pour gagner de l'argent             | S    | ★★★     | v1      |
| Compétences / stats qui débloquent actions et achats  | M    | ★★★     | v1      |
| Dépenses de vie (loyer) prélevées à chaque période    | S    | ★★      | v1      |
| Vieillissement et mort (espérance de vie)             | M    | ★★★     | v1      |
| Repousser la mort (santé, soins)                      | M    | ★★      | v2      |

## Sommeil

| Idée                                                                 | Coût | Intérêt | Verdict |
| -------------------------------------------------------------------- | ---- | ------- | ------- |
| Dormir est une action qui convertit les marqueurs en points          | M    | ★★★     | v1      |
| Les autres actions donnent une chance de marqueur (maximum fixe)     | M    | ★★★     | v1      |
| Maximum de marqueurs qui varie selon l'âge, la santé                 | S    | ★★      | v2      |

Détail v1 dans [v1.md](v1.md#3-sommeil-et-marqueurs). Pas de cycle jour / nuit.

## Économie et entreprises

| Idée                                                    | Coût | Intérêt | Verdict      |
| ------------------------------------------------------- | ---- | ------- | ------------ |
| Acheter de petites entreprises (= générateurs)          | M    | ★★★     | v1           |
| Embaucher des employés (améliore / automatise)          | M    | ★★★     | v1           |
| Entreprises par quartier, chaînes (fast-food, super.)   | L    | ★★      | v2           |
| Une marchandise : production → stock → commerce         | M    | ★★★     | v1           |
| Plusieurs marchandises, chaînes de production           | L    | ★★      | plus tard    |
| Suivi recettes / dépenses (compta)                      | M    | ★★      | v1 (simple)  |
| Réputation gagnée, perdue, dépensée pour débloquer      | M    | ★★★     | v1           |

La v1 a deux ressources : l'argent et **une seule marchandise** (stock). Les
chaînes de production à plusieurs marchandises interdépendantes sont un jeu en
soi : à n'ouvrir que si la boucle de base est solide.

## La ville

| Idée                                                        | Coût | Intérêt | Verdict |
| ----------------------------------------------------------- | ---- | ------- | ------- |
| Représentation de la ville (carte de quartiers)             | M    | ★★★     | v1      |
| Quartiers avec propriétés différentes (loyer, clients)      | M    | ★★      | v2      |

Piste v1 : une carte **schématique** (quartiers cliquables, un bâtiment par
entreprise possédée), sans simulation de déplacement. Les quartiers se débloquent. Les indicateurs
d'impact y sont lisibles (couleur ou jauge par quartier).

## Relations (amis, contacts, famille)

Apports possibles, à choisir : bonus passifs (un contact = un multiplicateur),
déblocage d'opportunités (emploi, prêt, licence), soutien en cas de crise,
**héritage** à la mort (famille = lien vers la vie suivante).
Verdict : **hors v1**. Famille liée au changement de vie ; amis et contacts gardés pour le futur.

## Origines (pauvre / riche)

| Idée                                                    | Coût | Intérêt | Verdict |
| ------------------------------------------------------- | ---- | ------- | ------- |
| Deuxième départ + personnalisation (loyer gratuit, capital, stats) | S | ★★★ | v2 |
| Dépend de la situation des parents (= héritage)         | M    | ★★★     | v2      |

À prévoir dès la v1 : l'état initial est une **donnée** (capital, logement,
stats de départ), pas du code.

## Illégal, politique, monde

| Idée                                                         | Coût | Intérêt | Verdict   |
| ------------------------------------------------------------ | ---- | ------- | --------- |
| Activités moins légales (plus rapide, plus risqué)           | M    | ★★★     | v2        |
| Police / événements (contrôles, amendes, prison)             | M    | ★★      | v2        |
| Politique de la ville (lois, taxes, élections, corruption)   | L    | ★★★     | plus tard |
| PNJ (maire, rivaux, mafia)                                   | L    | ★★      | plus tard |
| Indicateurs d'impact sur la ville (pauvreté, pollution…)     | M    | ★★★     | v1 (affichage) |
| « Changer le monde » comme but                               | -    | -       | abandonné |

Le chemin illégal est le **choix significatif** du jeu (vitesse vs risque). Il
demande un système d'événements aléatoires : prévoir un tirage reproductible
(graine dans l'état) pour garder des règles pures et testables.

## Tranches

1. **v1 : une vie.** Voir [v1.md](v1.md).
2. **v2 : plusieurs vies.** Changement de vie (transmission d'argent, de statut,
   de compétences ou d'idéologie, à trancher), deuxième départ et
   personnalisation, famille, quartiers aux propriétés différentes, chaînes
   d'entreprises, activités illégales et police, bilan de fin de vie.
3. **v3 : la ville vivante.** Politique, PNJ, amis et contacts, chaînes de
   production, indicateurs d'impact qui agissent sur le jeu.

On ne passe à la tranche suivante que quand la précédente est amusante.
