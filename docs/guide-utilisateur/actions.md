# Les actions

[Sommaire](README.md) · Précédent : [Ville](onglet-ville.md) · Suite : [Les améliorations](ameliorations.md)

Ce que vous pouvez faire dans le jeu, avec pour chaque geste son effet, son
coût et ses conditions. Chaque action est lancée depuis un onglet précis.

| Action                         | Où                              | Temps (jauge de 70) | Coût                     |
| ------------------------------ | ------------------------------- | ------------------- | ------------------------ |
| Travailler                     | [Vie](onglet-vie.md)            | 10                  | Aucun                    |
| Étudier                        | [Vie](onglet-vie.md)            | 15                  | 20 à 260 €               |
| Vendre le surplus              | [Vie](onglet-vie.md)            | 5                   | Aucun                    |
| Dormir                         | Automatique, durée dans [Profil](onglet-profil.md) | 12 à 26 en tout (selon la durée) | Aucun |
| Prendre un poste               | [Emploi](onglet-emploi.md)      | 0                   | 0 à 10 de réputation     |
| Acheter une entreprise         | [Entreprises](onglet-entreprises.md) | 0                   | Prix de l'entreprise     |
| Acheter un petit entrepôt      | [Entreprises](onglet-entreprises.md) | 0                   | 160 € puis +3 % chaque   |
| Acheter une amélioration       | [Améliorations](onglet-ameliorations.md) | 0                   | Prix de l'amélioration   |
| Annuler une amélioration       | [Améliorations](onglet-ameliorations.md#obtenues) | 0           | Aucun, sans remboursement |
| Débloquer un quartier          | Entreprises ou [Ville](onglet-ville.md) | 0              | 1, 22 ou 33 de réputation |

Les achats, les changements de poste et les déblocages n'avancent pas la
jauge : le temps ne passe que par le travail, l'étude, le surplus et le sommeil.

## Travailler

Votre action principale. Vous travaillez à votre poste (le seul lieu de
travail que propose cette version) :

- **Salaire** du poste, versé à la fin de la période (320 € pour l'intérim, voir
  [Emploi](onglet-emploi.md#les-quatre-postes)).
- **Réputation** du poste (0,2 pour l'intérim), multipliée par ×1,25 avec les
  Cartes de visite.
- **Marqueur** : 0,3 marqueur de Métier par action (un toutes les 3 à 4 actions).
- **Temps** : 10 sur la jauge de 70.
- **Heures supplémentaires** : les trois premières actions de la période
  (30 de jauge) paient les 8 h de la journée. Ensuite, sans rien débloquer,
  chaque action est payée +25 % (jusqu'à 50 de jauge de travail) puis +35 %, et
  remplit la jauge de 35 % de plus (13,5 au lieu de 10) : on est fatigué, le mois
  passe plus vite. Le bouton annonce « heures sup. +25 % » quand c'est le cas.

À partir de 60 ans (senior), le salaire et la réputation d'une action manuelle
sont divisés par deux. Pendant le confinement (de mars 2020 à février 2021), chaque
action de travail remplit la jauge de 15 au lieu de 10.

Le bouton est grisé après la mort du personnage (« Partie terminée »).

## Étudier

Disponible quand une formation est achetée, et tant qu'un cursus est utile.

- **Coût** : le prix du cursus, payé à chaque séance.
- **Marqueur** : 0,7 marqueur de la compétence du cursus par action (environ 7 marqueurs en 10 études).
- **Temps** : 15 sur la jauge.
- Pas de gain immédiat : le gain vient du sommeil.

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

Dormir n'est pas une action : le personnage dort **une fois par période**, à
heure fixe. Une période est une journée qui commence au réveil de 7 h ; vous
choisissez la durée de sommeil (court 4 h, moyen 6 h ou long 8 h ; long au
départ) dans l'onglet
[Profil](onglet-profil.md#le-sommeil).

| Durée   | Long (8 h) | Moyen (6 h) | Court (4 h) |
| ------- | ---------- | ----------- | ----------- |
| Coucher | 23 h       | 1 h         | 2 h         |
| Réveil  | 7 h        | 7 h         | 6 h         |
| Marqueurs laissés | 0 (tout le cerveau est vidé) | 1 | 2 |

Long vide tous les marqueurs : c'est la durée de l'apprentissage. Moyen en
laisse un et Court deux, qui attendent le sommeil suivant (ou sont perdus si le
cerveau est plein) : plus de temps éveillé pour gagner de l'argent, mais moins
d'apprentissage. Quand on est riche, on dort court.

1. La jauge atteint l'heure du coucher : pastille « Zzz », barre « Sommeil ». Un
   cerveau plein ne fait plus dormir ; ses marqueurs en trop sont perdus.
2. Le sommeil se joue en pas, un par marqueur que la durée permet de vider
   (tout le cerveau pour long, un de moins pour moyen, deux de moins pour court ;
   un pas au moins, même sans rien à vider).
   Chaque pas vide le plus ancien marqueur, s'il y en a un.
3. Chaque marqueur vidé donne des **points** à sa compétence : 1 point multiplié
   par la conversion du logement (voir ci-dessous).
4. Le sommeil complet coûte la durée dormie sur les 24 h de la jauge (8 h = 23,3
   de jauge sur 70), et dure une demi-seconde.
5. Au réveil, les gestes manuels gardés pendant le sommeil sont rejoués.

Si une action traverse l'heure du coucher et la fin de la période d'un coup, le
sommeil manqué est rattrapé : le personnage s'endort dès le début de la période
suivante.

Dormir moins laisse plus de temps éveillé pour travailler, mais convertit moins
de marqueurs en points : c'est un compromis.

| Logement                  | Conversion du sommeil | Loyer ajouté       |
| ------------------------- | --------------------- | ------------------ |
| Studio (départ)           | ×1                    | Loyer de départ : 300 € |
| Studio rénové             | ×1,3                  | +95 €              |
| Pavillon aux Tilleuls     | ×2,6                  | +700 €             |
| Loft au Pôle d'Excellence | ×3,25                 | +1 950 €           |

Pendant le sommeil, vos clics sont mis de côté (cinquante au plus) et le
travail automatique attend.

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

Bouton de la Vie. Vend **tout** le stock d'un coup à 4 € l'article et remplit
la jauge de 5. L'argent est compté à part dans les Comptes (« Vente du surplus »).
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
  Elle remplit la jauge comme une action normale (10) et donne aussi sa chance de
  marqueur.
- **Pendant le sommeil** : l'automatique attend le réveil.
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
