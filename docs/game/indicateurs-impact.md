# Indicateurs d'impact sur la ville

> Statut : **décidé** ([ADR 0004](../../.claude/adr/0004-indicateurs-d-impact.md)).

Au lieu de « changer le monde », le joueur voit **ce que sa vie fait à la ville**
([concept.md](concept.md)). La carte de la ville est le support naturel
(jauge ou couleur par quartier).

## Candidats

| Indicateur   | Ce qui le fait monter / baisser (exemples)                  |
| ------------ | ----------------------------------------------------------- |
| Pauvreté     | Bas salaires, licenciements, loyers élevés                  |
| Inégalités   | Écart entre le personnage et les habitants                  |
| Pollution    | Industrie, transport                                        |
| Autonomie    | Emplois locaux, indépendance de la ville vis-à-vis du joueur |

La liste est à décider.

## Décidé pour la v1

1. **Indicateurs** : Pollution et Inégalités. Pauvreté et Autonomie sont écartées.
2. **Rôle** : affichage seul, aucune rétroaction sur le jeu.
3. **Calcul** : dérivé de l'état (pur, sans accumulation) ; une valeur par
   quartier débloqué et une valeur globale pour la ville, de 0 à 100.
4. **Lien avec la fin** : aucun effet sur la fin de partie, mais les indicateurs
   sont affichés pendant la partie et dans le bilan de fin de partie.
5. **Lien avec l'illégal** : aucun (hors v1).

Les formules et leurs constantes sont dans l'ADR 0004.

## Pistes

_Vide pour l'instant._
