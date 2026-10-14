# Les actions

[Sommaire](README.md) · Précédent : [Ville](onglet-ville.md) · Suite : [Les améliorations](ameliorations.md)

Ce que vous pouvez faire dans le jeu, avec pour chaque geste son effet, son
coût et ses conditions. Chaque action est lancée depuis un onglet précis.

| Action                         | Où                              | Temps d'éveil       | Coût                     |
| ------------------------------ | ------------------------------- | ------------------- | ------------------------ |
| Travailler                     | [Vie](onglet-vie.md)            | 200 min             | Aucun                    |
| Étudier                        | [Vie](onglet-vie.md)            | 300 min             | 20 à 260 €               |
| Vendre le surplus              | [Vie](onglet-vie.md)            | 100 min             | Aucun                    |
| Dormir                         | Automatique, à la fin de la période | Aucun (hors jauge)  | Aucun |
| Prendre un poste               | [Emploi](onglet-emploi.md)      | 0                   | 0 à 10 de réputation     |
| Acheter une entreprise         | [Entreprises](onglet-entreprises.md) | 0                   | Prix de l'entreprise     |
| Acheter un petit entrepôt      | [Entreprises](onglet-entreprises.md) | 0                   | 160 € puis +3 % chaque   |
| Acheter une amélioration       | [Améliorations](onglet-ameliorations.md) | 0                   | Prix de l'amélioration   |
| Annuler une amélioration       | [Améliorations](onglet-ameliorations.md#obtenues) | 0           | Aucun, sans remboursement |
| Débloquer un quartier          | Entreprises ou [Ville](onglet-ville.md) | 0              | 1, 22 ou 33 de réputation |

Les achats, les changements de poste et les déblocages n'avancent pas la
jauge : le temps d'éveil ne passe que par le travail, l'étude et le surplus. Le
sommeil, lui, n'occupe pas la jauge : il est déjà décompté de la journée.

## Travailler

Votre action principale. Vous travaillez à votre poste (le seul lieu de
travail que propose cette version) :

- **Salaire** du poste, versé à la fin de la période (320 € pour l'intérim, voir
  [Emploi](onglet-emploi.md#les-quatre-postes)).
- **Réputation** du poste (0,2 pour l'intérim), multipliée par ×1,25 avec les
  Cartes de visite.
- **Marqueur** : 0,3 marqueur de Métier par action (un toutes les 3 à 4 actions).
- **Temps** : 200 minutes d'éveil.
- **Heures supplémentaires** : les trois premières actions de la période
  (600 minutes) paient la journée de travail. Ensuite, sans rien débloquer,
  chaque action est payée +25 % (jusqu'à 1 000 minutes de travail) puis +35 %, et
  dure 35 % de plus (270 minutes au lieu de 200) : on est fatigué, le mois
  passe plus vite. Le bouton annonce « heures sup. +25 % » quand c'est le cas.

À partir de 60 ans (senior), le salaire et la réputation d'une action manuelle
sont divisés par deux. Pendant le confinement (de mars 2020 à février 2021), chaque
action de travail dure 300 minutes au lieu de 200.

Le bouton est grisé après la mort du personnage (« Partie terminée »).

## Étudier

Disponible quand une formation est achetée, et tant qu'un cursus est utile.

- **Coût** : le prix du cursus, payé à chaque séance.
- **Marqueur** : 0,7 marqueur de la compétence du cursus par action (environ 7 marqueurs en 10 études).
- **Temps** : 300 minutes d'éveil.
- Pas de gain immédiat : le gain vient de la nuit (fin de période).

| Cursus                       | Compétence   | Coût par séance | Formation à acheter                     |
| ---------------------------- | ------------ | --------------- | --------------------------------------- |
| Posture professionnelle      | Métier       | 20 €            | Stage « Posture professionnelle »       |
| Gestion des opportunités     | Gestion      | 150 €           | BTS « Gestion des opportunités »        |
| Économie appliquée           | Intelligence | 190 €           | Licence d'économie appliquée            |
| Dépassement de soi           | Endurance    | 260 €           | Coaching « Dépassement de soi »         |

Un cursus n'est proposé que si sa compétence n'a pas atteint le palier 4. Si
vous n'avez pas assez d'argent, le bouton est grisé (« Argent insuffisant »).

## Les marqueurs

Un marqueur est un petit jeton de progression dans le cerveau. Chaque action de
travail ou d'étude en donne régulièrement :

| Action                  | Part de marqueur par action | Compétence concernée            |
| ----------------------- | --------------------------- | ------------------------------- |
| Travailler              | 0,3                         | Métier                          |
| Étudier                 | 0,7                         | Celle du cursus                 |

Il n'y a **aucun hasard** : chaque compétence cumule la part de ses actions et
donne un marqueur dès que le total atteint 1 (le reste est gardé). Travailler
donne ainsi un marqueur de Métier toutes les 3 à 4 actions, toujours dans le même
rythme.

Le cerveau contient 5 marqueurs au maximum. L'**Agenda électronique** (+30 %)
et l'**Assistante de direction** relèvent la part gagnée à chaque action, comme les
coups de pouce temporaires de [Améliorations](onglet-ameliorations.md). Il n'y a pas
d'autre source de marqueurs dans cette version : Gestion, Intelligence et Endurance ne
progressent que par l'étude.

## Dormir

Dormir n'est pas une action et ne se règle pas : une période est une **journée
de 24 h** (elle fait un mois de jeu, vous ne voyez que la date), dont une part
est du sommeil. Le reste est le **temps d'éveil**, que mesure la jauge de temps,
et chaque action y prend sa durée en minutes. Le sommeil de base dépend de l'âge
(la tranche de vie) et ne bouge que par des améliorations.

| Tranche de vie | Âges            | Sommeil de base | Éveil |
| -------------- | --------------- | --------------- | ----- |
| Petite enfance | 0 à 5 ans       | 12 h            | 12 h  |
| Enfance        | 6 à 12 ans      | 10 h            | 14 h  |
| Adolescence    | 13 à 17 ans     | 9 h             | 15 h  |
| Jeunesse       | 18 à 29 ans     | 8 h             | 16 h  |
| Âge adulte     | 30 à 49 ans     | 7 h             | 17 h  |
| Maturité       | 50 à 64 ans     | 7 h             | 17 h  |
| Vieillesse     | 65 ans à la fin | 6 h             | 18 h  |

Le nombre d'actions par période s'en déduit : une action qui dure 200 minutes
tient 4,8 fois dans 16 h d'éveil. L'onglet [Vie](onglet-vie.md#le-cerveau-et-le-sommeil)
affiche « Sommeil : 8 h par jour (éveil : 16 h) » et, sous chaque bouton,
« encore N fois » : le nombre de fois que vous pouvez agir avant la nuit
(l'action qui déborde sur la nuit compte, son surplus passe à la période suivante).

Deux familles d'améliorations changent le sommeil :

- **Dormir mieux** (Matelas à mémoire de forme : +1 h) : moins de temps éveillé,
  mais chaque marqueur donne plus de points (le rendement vaut sommeil / base,
  9 h au lieu de 8 donne ×1,125).
- **Optimiser son sommeil** (Application de suivi du sommeil, Micro-siestes en
  réunion : −1 h chacune) : une heure d'éveil de plus, donc des actions de plus,
  et l'apprentissage ne baisse pas.

À la fin de la période, la nuit convertit **tous les marqueurs** du cerveau en
**points** de leur compétence, d'un coup, sans pause : 1 point par marqueur,
multiplié par la conversion du logement, les coups de pouce de sommeil et le
rendement d'apprentissage. L'onglet Vie rappelle la dernière nuit (« 3 marqueurs
convertis »).

| Logement                  | Conversion du sommeil | Loyer ajouté       |
| ------------------------- | --------------------- | ------------------ |
| Studio (départ)           | ×1                    | Loyer de départ : 300 € |
| Studio rénové             | ×1,3                  | +95 €              |
| Pavillon aux Tilleuls     | ×2,6                  | +700 €             |
| Loft au Pôle d'Excellence | ×3,25                 | +1 950 €           |

Les loyers des logements s'**additionnent** : acheter le Pavillon sans annuler le
Studio rénové fait payer les deux loyers, et c'est le dernier logement acheté qui
détermine la conversion. Annuler un logement dans Obtenues retire son loyer.

## Prendre un poste

Dans [Emploi](onglet-emploi.md) : bouton « Prendre ». Il demande les compétences
et la réputation indiquées, et dépense la réputation du poste. L'effet est
immédiat : le salaire change à la prochaine action.

## Acheter une entreprise ou un petit entrepôt

Dans [Entreprises](onglet-entreprises.md), sous-onglet À acheter. Le prix de
l'exemplaire suivant (l'**apport**) augmente de 32 % à 130 % selon le type à
chaque exemplaire possédé (3 % pour le petit entrepôt), arrondi à l'euro.
L'achat est refusé si l'argent manque, si les conditions ne sont pas remplies,
si le plafond d'exemplaires du type est atteint, ou si votre production
dépasserait la capacité d'un entrepôt que vous pouvez encore agrandir. Détails dans
[Les entreprises](entreprises.md).

## Acheter ou annuler une amélioration

Dans [Améliorations](onglet-ameliorations.md), sous-onglet À acheter. Une
amélioration s'achète une seule fois. Son prix est dépensé tout de suite, et
son éventuel loyer ou ses salaires s'ajoutent aux prélèvements de chaque mois.
Détails dans [Les améliorations](ameliorations.md). Pour l'annulation, voir
[Obtenues](onglet-ameliorations.md#obtenues).

## Débloquer un quartier

Dans [Entreprises](onglet-entreprises.md) (« Quartiers ») ou dans la fiche de
[Ville](onglet-ville.md). Il faut le palier de réputation du quartier et
dépenser son prix en réputation. Voir [Les systèmes](systemes.md#les-quartiers).

## Vendre le surplus

Bouton de la Vie. Vend **tout** le stock d'un coup à 4 € l'article et prend
100 minutes d'éveil. L'argent est compté à part dans les Comptes (« Vente du surplus »).
Voir [Les entreprises](entreprises.md#le-surplus).

## Le travail automatique

Une fois l'amélioration **Procédure de travail** achetée (90 000 €, phase de
vie « Dirigeant »), le bouton Travailler peut travailler tout seul.

- **Activer ou couper** : appui long (500 millisecondes) sur Travailler. Le
  bouton affiche une pastille « Auto » et l'indication « Appui long : couper
  l'automatique » tant que c'est actif. Un appui long supplémentaire coupe.
  Le jeu confirme par « Travail automatique activé » ou « coupé ».
- **Rythme** : une action de travail toutes les demi-secondes, soit deux par
  seconde, à votre poste.
- **Rendement** : chaque action automatique rapporte moitié moins qu'une action
  manuelle (160 € au lieu de 320 € pour l'intérim), salaire et réputation compris.
  Elle prend le temps d'une action normale (200 minutes) et donne aussi sa chance de
  marqueur.
- **Quand il tourne** : tant que la page est ouverte et visible, et pendant votre
  absence (voir [Les systèmes](systemes.md#labsence-et-le-rattrapage)). Sans
  l'automatique, le temps ne passe jamais tout seul.

Cliquer à la main reste utile : une action manuelle rapporte deux fois plus
qu'une action automatique.

## L'appui maintenu

Garder le doigt ou la souris appuyé sur un bouton d'action le répète
**quatre fois par seconde** (toutes les 250 millisecondes), sans reclic.

- S'applique aux trois boutons de la Vie : Travailler, Étudier (partie
  gauche du bouton) et Vendre le surplus.
- Le premier clic part dès l'appui ; la répétition s'arrête au relâchement, quand
  le pointeur sort du bouton, ou quand l'action devient impossible (plus
  d'argent, plus de stock).
- Les achats, les changements de poste, les déblocages et « Recommencer » ne
  se répètent jamais.
- Le clavier ne répète jamais : maintenir Entrée ou Espace ne fait qu'une action.
- Sur Travailler, l'appui long de 500 millisecondes qui bascule l'automatique
  cohabite avec la répétition : pendant l'appui, le bouton continue de
  travailler (quatre fois par seconde). Doigt levé, l'automatique reprend à deux
  par seconde.
- Sur écran tactile, le menu contextuel du navigateur ne s'ouvre pas pendant
  un appui maintenu.
