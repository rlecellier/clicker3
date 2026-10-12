# La version 1.5

[Sommaire](README.md) · Suite : [Débuter](debuter.md)

## Le jeu en une page

Vous incarnez Camille Morel, 18 ans, le 1er janvier 1999, premier jour de l'euro.
Vous habitez Sainte-Croissance, une ville inventée dont le slogan est « ville en
mouvement ». Votre vie dure jusqu'à 75 ans, soit 684 mois, et ne se joue qu'une
fois : il n'y a ni seconde chance, ni héritage, ni prestige. Quand la vie
s'arrête, le jeu affiche un bilan, et vous pouvez recommencer la même vie.

Le principe tient en quatre phrases :

- le temps n'avance que lorsque vous agissez : chaque action remplit une jauge,
  et quand la jauge est pleine, un mois passe ;
- vous travaillez pour gagner de l'argent et étudier pour progresser ;
- l'argent sert à acheter des entreprises (qui produisent des articles ou les
  vendent) et des améliorations ;
- ce que vous gagnez en réputation ouvre les quartiers de la ville et les
  meilleurs postes.

À la fin, le jeu fait le bilan : entreprises possédées, argent, âge atteint,
réputation bâtie. Le message de clôture précise le nombre de week-ends, qui est
de zéro.

Le jeu se joue dans un navigateur, sur ordinateur comme sur téléphone. La
partie est sauvegardée dans le navigateur (voir [Les systèmes](systemes.md)).

## Ce que la version 1.5 change

La version 1.5 est une version de correctifs de lisibilité. Elle ne change pas
les règles du jeu, elle rend lisibles celles qui existaient.

| Avant                                                                 | Maintenant                                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Une seule page empilait huit fenêtres                                 | Sept onglets, un par ancienne fenêtre. L'onglet ouvert reste le même quand vous rechargez la page (voir [les onglets](README.md#les-sept-onglets)) |
| Les messages faisaient sauter l'écran                                 | Une pastille de non-lus sur Courrier et une petite popup qui ne bloque jamais le jeu ([Courrier](onglet-courrier.md)) |
| L'argent et la date se perdaient dans la page                         | Un en-tête fixe : l'argent et la jauge du mois sont visibles sur tous les onglets                            |
| La prochaine amélioration était une simple phrase                     | La phrase est un lien : un clic vous mène à l'amélioration visée, mise en évidence quelques secondes         |
| La réputation s'affichait autrement que les compétences               | Le palier de réputation est une barre de progression, comme une compétence ([Compétences](onglet-competences.md)) |
| On ne savait pas ce qui était nouveau                                 | Une pastille de nouveautés sur Compétences, Emploi, Investir et Ville : elle compte ce qui vient de se débloquer |
| Les boutons bougeaient quand « Étudier » apparaissait                 | Les boutons gardent leur place en toutes circonstances                                                       |
| Étudier proposait des cursus déjà terminés                            | Seuls les cursus encore utiles sont proposés ; le bouton disparaît quand tout est terminé. Une petite jauge sous le bouton montre la progression de la compétence visée |
| Les améliorations donnaient des valeurs de base                       | Investir affiche les valeurs réelles (tous bonus appliqués), et chaque amélioration dit en chiffres ce qu'elle change et sur quoi ([Investir](onglet-investir.md)) |
| Les comptes ne montraient que la dernière période, sans détail        | Comptes montre une période à la fois (en cours, trois précédentes, cumul) avec l'origine des recettes, la destination des dépenses et les mouvements du stock ([Comptes](onglet-comptes.md)) |
| Il fallait cliquer sans cesse                                         | Garder le doigt appuyé sur un bouton d'action répète l'action quatre fois par seconde ([Les actions](actions.md)) |
| Tout se faisait à la souris                                           | Raccourcis clavier : 1 à 7 pour les onglets, T pour travailler, E pour étudier ([Raccourcis](raccourcis-et-mobile.md)) |
| Le téléphone était un peu à l'étroit                                  | La sidebar passe en icônes sur petit écran, les zones tactiles font au moins 44 pixels, le jeu tient à 480 et à 360 pixels de large |

Deux rubriques sont aussi nouvelles : le détail de l'onglet **Comptes** (une fois
le Tableau de bord acheté) et la liste **Obtenues** dans Investir, qui regroupe
vos améliorations et permet de les annuler.

## Ce que la version 1.5 ne change pas

- **L'équilibrage.** Les prix, les salaires, les durées, les chances et les
  bonus sont ceux de la version 1. Le simulateur d'une vie donne exactement la
  même vie qu'avant.
- **La durée d'une vie.** Pour un joueur virtuel, une vie représente environ une
  demi-heure de jeu actif (30 minutes 37 secondes), plus de l'attente une fois
  le travail automatique acheté. La cible de conception est de 30 à 60 minutes
  de jeu actif.
- **Le contenu.** Mêmes quatre emplois, mêmes six types d'entreprises, mêmes
  quatre quartiers, mêmes 19 améliorations, mêmes messages.

## Vos sauvegardes de la version 1

Une sauvegarde de la version 1 se charge sans perte : le jeu la met à jour
tout seul au chargement. Une seule différence : pour les mois déjà joués avant
la mise à jour, l'onglet Comptes affiche « Détail indisponible pour cette
période », car la version 1 ne gardait pas ces détails. Tout ce que vous jouez
après est détaillé.

## Ce qui n'existe pas

Le jeu ne propose pas, dans cette version : de prestige, d'héritage, de
deuxième personnage, de choix dans les messages, de travail dans une entreprise
plutôt qu'à son poste, de plusieurs marchandises, de politique, de police ou
d'activités illégales. Si un texte du jeu laisse penser le contraire, c'est de
l'humour.

Suite : [Débuter](debuter.md).
