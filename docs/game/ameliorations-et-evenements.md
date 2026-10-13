# Améliorations et événements

> Statut : contenu **décidé** dans son principe pour la v1, dans la voix décrite dans
> [ton-et-univers.md](ton-et-univers.md). Les prix et effets sont des **ordres de
> grandeur** à caler au simulateur ([v1.md](v1.md)). Une période = un mois ;
> la partie commence en période 0 (janvier 1999).

## Améliorations (19 achats uniques)

La vingtième, l'automatisation du sommeil, a été retirée : le sommeil vient
seul ([ADR 0007](../../.claude/adr/0007-sommeil-passif.md)).

Chaque amélioration a un nom, un effet de jeu, un déblocage et une phrase de
description. Prix : **€** (ordre de grandeur, croissance à régler). Les paliers
de stats se fixent avec les chiffres ; ici on donne le rang (P1 à P4).

### Formations (4)

Elles ouvrent des cursus et des paliers. Acheter coûte de l'argent, la progression
passe ensuite par l'action « Étudier » puis par le sommeil.

| Nom                               | Effet                                          | Déblocage         | Prix    | Description                                                              |
| --------------------------------- | ---------------------------------------------- | ----------------- | ------- | ------------------------------------------------------------------------ |
| Stage « Posture professionnelle » | Étudier donne des marqueurs Métier             | Départ            | 150 €   | « Deux jours pour apprendre à sourire sans y croire. »                   |
| BTS « Gestion des opportunités »  | Étudier donne des marqueurs Gestion            | Métier P1         | 1 500 € | « Une opportunité se gère comme un risque, en moins amusant. »           |
| Licence d'économie appliquée      | Étudier donne des marqueurs Intelligence       | Gestion P1        | 6 000 € | « Vous apprenez que tout est une question d'offre et de demande, sauf vous. » |
| Coaching « Dépassement de soi »   | Étudier donne des marqueurs Endurance          | Intelligence P1   | 12 000 €| « On vous explique que la fatigue est une croyance limitante. »          |

### Logement (3) : meilleur sommeil, loyer plus cher

| Nom                         | Effet                                   | Déblocage        | Prix (+loyer)    | Description                                                         |
| --------------------------- | --------------------------------------- | ---------------- | ---------------- | ------------------------------------------------------------------- |
| Studio rénové               | Conversion du sommeil ×1,5              | Endurance P1     | 4 000 € (+150 €) | « Rénové : un coup de peinture et une nouvelle moisissure. »        |
| Pavillon aux Tilleuls       | Conversion du sommeil ×2,5              | Endurance P2     | 40 000 € (+600 €)| « Quatre pièces, un crédit sur vingt-cinq ans. Le jardin est inclus. » |
| Loft au Pôle d'Excellence   | Conversion du sommeil ×4                | Endurance P3     | 400 000 € (+3 000 €)| « Vue sur d'autres lofts. Prix « dynamique ». »                  |

### Entrepôt et marqueurs (4)

| Nom                         | Effet                                   | Déblocage         | Prix       | Description                                                       |
| --------------------------- | --------------------------------------- | ----------------- | ---------- | ----------------------------------------------------------------- |
| Étagères en kit             | Capacité du stock ×2                    | Gestion P1        | 2 000 €    | « Montage en une heure. Le fabricant dit trois. »                 |
| Entrepôt logistique         | Capacité du stock ×5                    | Gestion P3        | 80 000 €   | « Un hangar à la sortie du rond-point. Il y en avait déjà vingt. »|
| Carnet de notes             | Maximum de marqueurs +2                 | Intelligence P1   | 800 €      | « Écrire ses objectifs rend 30 % plus performant. Source : un carnet. » |
| Application de productivité | Maximum de marqueurs +3                 | Intelligence P3   | 25 000 €   | « Vous avez maintenant une application pour vos applications. »   |

### Employés (3)

| Nom                         | Effet                                                    | Déblocage              | Prix (+salaire)     | Description                                                         |
| --------------------------- | -------------------------------------------------------- | ---------------------- | ------------------- | ------------------------------------------------------------------- |
| Premier collaborateur       | Une entreprise produit +50 % ; ouvre la phase Patron     | Gestion P2, 1 entreprise | 3 000 € (+900 €)    | « Pas un salarié : un collaborateur. Il le saura à la fiche de paie. » |
| Équipe de collaborateurs    | Toutes les entreprises +50 %                             | Gestion P3 + réputation  | 30 000 € (+6 000 €) | « Ils se sentent écoutés. Ils n'ont pas d'augmentation. »            |
| Directeur de la transformation | Toutes les entreprises +100 % ; ouvre l'emploi 4      | Gestion P4 + réputation  | 300 000 € (+25 000 €)| « Il transforme. Quoi ? Il reviendra vers vous. »                  |

### Automatisation et tableau de bord (2)

Le travail automatique s'active ou se coupe à volonté par un appui long sur
Travailler. Le sommeil n'a plus d'amélioration : il vient seul
([ADR 0007](../../.claude/adr/0007-sommeil-passif.md)). Une action automatique simule deux clics par seconde et rapporte 2×
moins qu'une manuelle ([v1.md](v1.md#6-automatisation-et-absence)).

| Nom                           | Effet                                       | Déblocage           | Prix      | Description                                                        |
| ----------------------------- | ------------------------------------------- | ------------------- | --------- | ------------------------------------------------------------------ |
| Procédure de travail          | Travail automatique                         | Phase Patron        | 20 000 €  | « Le travail se fait seul. Vous le surveillerez de loin. »         |
| Tableau de bord               | Affiche recettes, dépenses, flux de stock et de réputation | Gestion P2 | 5 000 €   | « Dix indicateurs. Un seul qui compte, que vous ne regardez pas. »|

### Matériel et réputation (3)

| Nom                         | Effet                                                    | Déblocage                | Prix       | Description                                                         |
| --------------------------- | -------------------------------------------------------- | ------------------------ | ---------- | ------------------------------------------------------------------- |
| Cartes de visite            | Réputation gagnée par le travail +25 %                   | Départ                   | 100 €      | « Papier épais. Le prénom ne figure pas, par souci de marque. »     |
| Camionnette d'occasion      | Débit des stands et des boutiques +15 %                  | Première entreprise      | 5 750 €    | « 240 000 km. Le compteur a été remis à l'honneur. »                |
| Plan de communication       | Ventes des commerces +25 % ; réputation +50 % par vente | Réputation palier 2      | 60 000 €   | « Votre histoire, mais en mieux. Surtout la fin. »                  |

## Événements

### Principe (proposition pour la v1)

- Un événement est un **message** (courrier, notification, communiqué) affiché au
  moment où une **condition** est vraie. Aucun choix du joueur en v1 : pas de
  boîte de dialogue, pas de bonne ou de mauvaise réponse.
- Certains ont un **petit effet automatique** et visible (réputation, argent,
  stock). Le texte l'annonce sans le commenter.
- Déclencheurs : une **période précise** (histoire du monde), un **âge**, un
  **état du jeu** (stock, argent, quartier débloqué). Tout vient de l'état, pas
  de `Date.now()` ; l'aléatoire, s'il existe, vient de la graine de l'état.
- Quelques événements sont **uniques** (jalons) ; d'autres peuvent se répéter
  (loyer, rupture).

### Histoire du monde (périodes fixes)

La date vient de la période ; 1 période = 1 mois, janvier 1999 = période 0.
Les événements **après 2020 restent volontairement vagues** (« vers »), sans
année ni chiffre précis dans le texte, pour ne pas dater le jeu.

| Date          | Événement                                  | Texte                                                                                           | Effet (optionnel)                         |
| ------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Janv. 1999    | Passage à l'euro                           | « Bienvenue dans l'euro. Votre compte est crédité de 0 €, ce qui est un bon début. »            | aucun                                     |
| Déc. 1999     | Bug de l'an 2000                           | « Le système pourrait cesser de fonctionner. Un consultant vous propose de l'éviter. Le système a continué. Le consultant aussi. » | dépense unique d'un mois de loyer         |
| Mars 2000     | Bulle internet                             | « Tout le monde lance une start-up. Aucune n'a encore de produit. Les investisseurs adorent. »  | commerces +20 % jusqu'au krach            |
| Oct. 2001     | Krach de la nouvelle économie              | « La nouvelle économie devient l'ancienne. Les actionnaires espèrent une reprise. »             | commerces retombent, réputation −1        |
| Janv. 2002    | Euro fiduciaire                            | « Les francs disparaissent. Les prix, eux, avaient déjà arrondi. »                              | loyer +5 %                                |
| Sept. 2008    | Crise financière                           | « Une banque a fait faillite. L'État la sauve. Vous êtes invité à comprendre que c'est normal. » | loyer et salaires +, argent −             |
| Vers 2012     | « Économie collaborative »                 | « Votre canapé est désormais un actif. Votre temps libre aussi. »                               | texte seul                                |
| Mars 2020     | Confinement                                | « Les emplois essentiels sont reconnus. Les rémunérations restent à l'étude. »                  | actions de travail ralenties un temps     |
| Vers 2030     | Intelligence artificielle                  | « Votre poste a été optimisé par un outil qui ne dort pas. Félicitations pour votre évolution. » | emplois 1 et 2 moins payés                |
| Vers 2045     | Climat                                     | « Il fait très chaud à Sainte-Croissance. La climatisation est un service premium. »                 | dépenses +                                |

### Événements de vie (âge)

| Âge | Texte                                                                                                         | Effet                                  |
| --- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 18  | « Vous êtes majeur. Les offres de crédit aussi. »                                                              | départ                                 |
| 30  | « Votre profil a évolué. Votre assurance aussi, dans le mauvais sens. »                                       | texte seul                             |
| 40  | « Vous avez réussi, dit-on. Selon quel critère, on vous le dira. »                                            | texte seul                             |
| 60  | « Vous passez Senior. Votre valeur d'expérience est reconnue, hors périmètre. »                                | phase Vieillesse                       |
| 70  | « Un conseiller en retraite vous contacte. Il a eu votre numéro par une entreprise que vous possédez. »       | texte seul                             |

### Événements d'état (déclenchés par le jeu)

| Condition                              | Texte                                                                                         | Effet                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| Loyer prélevé (chaque période)          | « Votre bail a été renouvelé à des conditions plus ambitieuses. »                              | −loyer                             |
| Impayé                                 | « Votre propriétaire a pris acte de votre situation. Il vous souhaite du courage. »            | réputation −                       |
| Première entreprise achetée            | « Vous êtes porteur de projet. Personne ne vous demande lequel. »                             | phase Entrepreneur                 |
| Premier collaborateur                  | « Vous êtes dirigeant. La différence avec un salarié : vous le dites. »                       | phase Patron                       |
| Rupture de stock                       | « Vos clients découvrent la rareté. Ils ne vous en sont pas reconnaissants. »                  | réputation −                       |
| Stock plein                            | « Votre entrepôt déborde. La production continue, par principe. »                             | invendu au-delà de l'entrepôt perdu |
| Réputation palier 1                    | « Partenaire de confiance. Vous avez un badge. »                                              | quartier 2 disponible              |
| Réputation palier 2                    | « Acteur majeur. Personne ne sait de quoi. »                                                  | quartier 3 disponible              |
| Réputation palier 3                    | « Vous êtes devenu une marque. Votre nom figure dans un tableau Excel. »                      | quartier 4 disponible              |
| Quartier 2 débloqué                    | « Les Hauts-Fourneaux vous ouvrent leurs portes. Elles étaient fermées pour requalification. » | carte                              |
| Quartier 3 débloqué                    | « Le parc Horizon est ouvert à tous les véhicules. »                                          | carte                              |
| Quartier 4 débloqué                    | « Le Pôle d'Excellence vous accueille. Il vous demande d'abord votre budget. »                | carte                              |
| Retour après absence                   | « Pendant votre absence, la croissance a continué. Elle n'a pas demandé de vos nouvelles. »    | écran « pendant votre absence »    |
| Mort                                   | « You died. Votre exercice est terminé. Bilan : N entreprises, 0 week-end. »                  | fin de partie                      |

Le « N » du bilan vient de l'état : entreprises possédées. D'autres lignes de
bilan (argent, âge, réputation) suivent le même modèle.

## Décisions

1. **Effets des événements historiques** : **petits effets** gardés (bulle,
   krach, crise, IA, etc.), modestes et lisibles, pour donner un rythme à la
   partie sans lourd équilibrage.
2. **Choix** : aucun en v1, les événements s'affichent. Un choix à deux options
   viendrait avec la tranche « événements aléatoires » du [backlog](backlog.md).
3. **Dates vagues** après 2020 : décidé, voir plus haut.

## Reste à faire

- Relire les textes à voix haute et couper tout ce qui cligne de l'œil.
- Chiffrer les effets et les prix au simulateur.
