# Débuter

[Sommaire](README.md) · Précédent : [La version 1.5](la-version-1-5.md) · Suite : [Courrier](onglet-courrier.md)

## L'écran titre

Au lancement, le jeu affiche « Sainte-Croissance » et sa devise, « Ville en
mouvement. ».

| Bouton                    | Quand il apparaît           | Effet                                                                                      |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| Démarrer ma vie           | Toujours                    | Mène au choix du premier emploi                                                            |
| Petite enfance, Enfance, Adolescence | Toujours (sous « Ou commencer ailleurs dans la vie : ») | Commence une tranche de vie d'avant 18 ans : un seul onglet, Vie, avec un bouton et un compteur. Pour la petite enfance, on choisit d'abord sa famille (« Famille standard » pour l'instant). Demande confirmation si une vie est en cours |
| Âge adulte, Maturité, Vieillesse | Toujours (au même endroit) | Reprend le jeu complet à 30, 50 ou 65 ans, avec ce que le personnage possède à cet âge. Demande confirmation si une vie est en cours |
| Reprendre                 | Si une partie est sauvegardée | Reprend la vie en cours là où vous l'avez laissée                                          |
| Effacer la sauvegarde     | Si une partie est sauvegardée | Demande confirmation (« Votre exercice sera clos sans bilan »), puis supprime la sauvegarde |

« Démarrer ma vie » est la tranche **Jeunesse**, le jeu complet décrit dans
ce guide. Les trois tranches d'avant 18 ans sont à peine ébauchées : l'onglet Vie
propose un bouton (« Gazouiller », « Jouer » ou « Se chercher ») qui fait monter
un compteur (« Éveil », « Curiosité » ou « Identité »), sans autre effet pour
l'instant. Âge adulte, Maturité et Vieillesse sont le même jeu, commencé plus loin dans la vie : l'argent, les entreprises, les améliorations et les stats sont ceux d'un joueur à cet âge, et la date suit (janvier 2011 à 30 ans). Détails : [tranches de vie](../game/tranches-de-vie.md).

Sans partie sauvegardée, tout lien vers le jeu vous ramène à l'écran titre.

## Le premier emploi

« Démarrer ma vie » ouvre l'écran « Première embauche » : « Il faut bien commencer
quelque part. » Un seul poste est à pourvoir : **Manutentionnaire intérimaire**,
« Salaire : 960 € par mois (320 € par action) ». Cliquez sur « Prendre ce poste ». Le bouton
« Retour » ramène à l'écran titre.

Si une vie est déjà en cours, le jeu demande d'abord confirmation (« Une vie est
déjà en cours. La recommencer l'archivera sans délai. ») : la vie en cours est
perdue si vous confirmez.

## Votre premier tour de jeu

Vous arrivez sur l'onglet **Vie**, le 1er janvier 1999, avec 0 € et un studio à
300 € de loyer par mois, plus 470 € de train de vie (courses, transport,
téléphone). En haut de l'écran se trouve l'en-tête fixe : votre
argent et la date, dont la barre se remplit à mesure que vous agissez. Dans la
Vie, trois boutons vous attendent. Au début, seuls deux servent :

1. **Travailler** : vous gagnez 320 € (le salaire de votre poste) et un peu de
   réputation. Une action de travail remplit la jauge de temps de 10 sur 70.
2. **Vendre le surplus** : grisé, vous n'avez pas de stock.
3. **Étudier** : absent. Il apparaîtra quand vous aurez acheté une formation.

Sept actions de travail remplissent la jauge (un peu moins une fois les heures
supplémentaires atteintes) : un mois passe, le loyer (300 €) et le train de vie
(470 €) sont prélevés et la date avance. Chaque mois, vous recevez aussi un message
dans le Courrier (le bail renouvelé « à des conditions plus ambitieuses »).

Au tout début, deux messages vous attendent déjà dans le Courrier : la pastille
affiche 2. Vous y lirez que vous êtes majeur et que vous passez à l'euro.

Le jeu indique toujours quoi viser : sur l'onglet Vie, la note placée sous
l'état civil annonce (sur grand écran ; sur téléphone, suivez la pastille
d'Améliorations) la prochaine amélioration, par exemple « Prochain achat : Cartes de visite (58 €) ».
Cliquez dessus pour être mené à cette amélioration dans [Améliorations](onglet-ameliorations.md).

Un bon début de partie :

1. travailler jusqu'à réunir 58 € ; acheter les **Cartes de visite** ;
2. acheter le **Stage « Posture professionnelle »** (420 €) : « Étudier » apparaît ;
3. alterner travail et étude pour atteindre le palier 1 de Métier (2 points) :
   il ouvre l'emploi suivant et le BTS, qui ouvre à son tour la Gestion ;
4. avec le palier 1 de Gestion (2 points), acheter vos premières entreprises.

Ce n'est qu'un chemin parmi d'autres : [Les actions](actions.md) et
[Les entreprises](entreprises.md) détaillent chaque choix.

## La jauge de temps

La barre de l'en-tête porte la date du mois en cours (« janvier 1999 ») et, à
sa droite, ce que fait votre personnage : au travail, en formation, endormi.
Elle se
remplit par les actions, jamais toute seule, sauf en mode automatique ou
pendant le sommeil. Capacité d'une période : **70**.

| Geste                       | Remplit la jauge de |
| --------------------------- | ------------------- |
| Travailler                  | 10                  |
| Étudier                     | 15                  |
| Dormir (sommeil complet)    | 12 à 26 (8 h : 23)  |
| Vendre le surplus           | 5                   |

Quand la jauge atteint 70, le mois se termine dans cet ordre :

1. les entreprises de production versent leur production dans le stock ;
2. les commerces vendent le stock et rapportent de l'argent ;
3. le loyer, le train de vie et les salaires de vos employés sont prélevés ;
4. si votre argent est négatif, les intérêts de la dette s'ajoutent (1,5 %) ;
5. vous vieillissez d'un mois et les messages du nouveau mois arrivent ;
6. la jauge repart, en gardant l'excédent.

## L'argent

L'argent s'affiche en haut de l'écran, sur tous les onglets. Il vient des
salaires de votre emploi et des ventes de vos commerces. Il part dans les
études, les achats, le loyer, le train de vie et les salaires de vos employés.

- On n'achète rien si l'on n'a pas la somme : un achat trop cher reste grisé,
  avec la raison (« Argent insuffisant »).
- Le loyer et les salaires, eux, sont toujours prélevés en entier, même quand
  l'argent manque. Le solde peut devenir **négatif** : c'est une dette, et un
  mois de dette fait perdre 2 points de réputation et coûte 1,5 % d'intérêts
  (arrondis à l'euro supérieur).
- Les montants du jeu sont des euros entiers.

## Une vie, de 18 à 75 ans

- Départ : 18 ans, janvier 1999.
- Chaque mois ajoute un mois d'âge : on a 19 ans en janvier 2000.
- À 60 ans (janvier 2041), vous passez senior : vos gains d'actions manuelles
  sont divisés par deux. L'automatisation devient alors le moyen d'avancer.
- À 75 ans (janvier 2056), c'est la fin : 684 mois en tout.

Pendant ces 57 ans, le monde traverse son histoire (bulle internet, krach, crise,
confinement, intelligence artificielle…) par le biais de messages, parfois
accompagnés d'un effet. La liste est dans [Les événements](evenements.md).

## La fin et « Recommencer »

À la mort du personnage, le jeu ouvre l'écran « Fin d'exercice » (« You died ») avec
le bilan : argent gagné sur toute la vie, argent final et capital placé, entreprises
possédées sur le total possible, améliorations achetées sur le total, logement, âge,
réputation. Acheter la dernière amélioration (le Marketplace) ouvre une pop-up une fois. Le bouton **Rejouer**
ramène au choix du premier emploi et recommence la même vie depuis le début.
Rien n'est transmis : ni argent, ni compétences.

Vous pouvez aussi recommencer à tout moment avec **Recommencer**, tout en bas de
la sidebar. Le jeu vous demande de confirmer avant d'écraser la vie en cours.

Suite : visitez les onglets, en commençant par [Courrier](onglet-courrier.md).
