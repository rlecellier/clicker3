# Les systèmes

[Sommaire](README.md) · Précédent : [Les entreprises](entreprises.md) · Suite : [Les événements](evenements.md)

Les règles qui tiennent le jeu debout, vues du côté du joueur.

## Les phases de vie

Votre phase s'affiche sous votre nom, dans l'onglet [Vie](onglet-vie.md).

| Phase affichée                           | Quand on y entre                                     | Ce qui change                                           |
| ---------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Jeune actif en devenir                   | Au départ, à 18 ans                                  | Travailler, étudier                                     |
| Entrepreneur (statut déclaré)            | Dès la première entreprise achetée                   | Un message vous félicite (« Vous êtes porteur de projet. Personne ne vous demande lequel. ») |
| Dirigeant (sans équipe de direction)     | Dès le premier employé (Premier collaborateur, Équipe de collaborateurs ou Directeur de la transformation) | Ouvre la Procédure de travail |
| …, senior                                | À 60 ans, en plus de la phase atteinte               | Les gains des actions manuelles sont divisés par deux   |

On ne redescend jamais de phase, même en annulant l'amélioration qui l'a
ouverte. La vieillesse, elle, se déduit simplement de l'âge.

## Le vieillissement et la mort

- Un mois de jeu fait vieillir d'un mois. Vous avez 18 ans en janvier 1999, 19 ans
  en janvier 2000, 60 ans en janvier 2041.
- À 75 ans, en janvier 2056, la vie s'arrête : 684 mois en tout. L'âge de la
  mort est fixe dans cette version.
- Le message de clôture est : « You died. Votre exercice est terminé. Bilan : N
  entreprises, 0 week-end. », avec N le nombre d'entreprises que vous possédez.
- Dès la mort, plus aucune action n'est possible : tous les boutons indiquent
  « Partie terminée ». Le jeu ouvre l'écran « Fin d'exercice » avec le bilan
  (entreprises possédées, argent, âge, réputation). Son bouton « Rejouer »
  recommence la même vie.

On peut mourir en votre absence (voir plus bas).

## La réputation

La réputation est la mesure de ce que la ville pense de vous. Deux comptes se
suivent : ce qui est **gagné au total** (qui détermine le palier) et ce qui
reste **disponible** (qu'on dépense).

**Ce qui en rapporte**

| Source                                | Quantité                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| Une action de travail                 | 0,2 / 0,3 / 0,5 / 0,8 selon le poste ; ×1,25 avec les Cartes de visite ; ÷2 si senior ou en automatique |
| Un article vendu par un commerce      | 0,02 ; 0,03 avec le Plan de communication                                               |

**Ce qui en fait perdre** (la réputation disponible ne descend jamais sous 0, et
le palier, lui, ne baisse pas)

| Cause                                          | Perte                      |
| ---------------------------------------------- | -------------------------- |
| Un commerce en rupture (il n'a pas pu vendre toute sa capacité) | 0,5 par commerce et par mois |
| Un impayé : l'argent est négatif après les prélèvements du mois | 2 par mois |
| Le krach de la nouvelle économie (octobre 2001) | 1                         |

**Ce qui en consomme** : le poste 3 (10), le poste 4 (9), et les quartiers (1,
22, 33).

**Les paliers** : 6, 100 et 170 de réputation gagnée. Voir
[Compétences](onglet-competences.md#la-réputation) et
[Les autres sources de bonus](autres-bonus.md#la-réputation).

## Les quartiers

Sainte-Croissance compte quatre quartiers. Les Tilleuls sont ouverts dès le
départ ; les trois autres s'ouvrent avec un palier de réputation **et** une
dépense de réputation.

| Quartier                  | Palier requis | Réputation à dépenser |
| ------------------------- | ------------- | --------------------- |
| Les Tilleuls              | Ouvert        | 0                     |
| Les Hauts-Fourneaux       | 1             | 1                     |
| Parc d'activités Horizon  | 2             | 22                    |
| Le Pôle d'Excellence      | 3             | 33                    |

Un quartier ouvert :

- reçoit sur le plan les bâtiments de ses entreprises ;
- est exigé par le Corner en hypermarché (Parc Horizon) et la Plateforme en ligne (Pôle
  d'Excellence) ;
- affiche ses jauges de pollution et d'inégalités ;
- déclenche un message quand vous l'ouvrez.

Une fois ouvert, il le reste. L'ouverture se fait depuis
[Investir](onglet-investir.md) ou [Ville](onglet-ville.md).

## Les entreprises, le stock et les ventes

Voir [Les entreprises](entreprises.md) : production, commerces, entrepôt, ventes
chaque mois, rupture, surplus.

## Les événements et le courrier

Un événement est un message déclenché par une date, un âge ou un état de votre
vie. Il tombe dans le [Courrier](onglet-courrier.md) et certains ont un petit
effet. Il n'y a jamais de choix à faire : on lit.

- Les événements du **monde** arrivent à des dates fixes, de 1999 à 2045.
- Ceux de la **vie** arrivent à des âges (18, 30, 40, 60, 70 ans).
- Ceux de l'**état du jeu** arrivent quand la situation s'y prête : loyer chaque
  mois, impayé, rupture, entrepôt plein, premières entreprises, paliers de
  réputation, quartiers ouverts.
- La plupart ne surviennent qu'une fois. Quelques-uns se répètent, au plus une
  fois par mois.

La liste complète est dans [Les événements](evenements.md).

## L'absence et le rattrapage

Le temps du jeu avance uniquement par les actions, sauf deux cas : le travail
automatique et le sommeil.

- **Sans travail automatique**, rien ne se passe quand vous n'êtes pas là. Vous
  retrouvez votre partie telle que vous l'aviez laissée.
- **Avec travail automatique actif**, le jeu continue de travailler à votre
  place. Au retour, il rejoue tout ce qui s'est passé pendant votre absence, sans
  limite de durée : une action automatique toutes les demi-secondes, soit
  environ 3,5 secondes réelles par mois de jeu. Dix minutes d'absence font donc
  vieillir de plus de dix ans. **Vous pouvez mourir pendant que vous êtes parti.**
- Le même rattrapage s'applique quand vous masquez l'onglet du navigateur
  (en changeant d'onglet ou de fenêtre) : le jeu ne tourne pas pendant ce
  temps et rattrape à votre retour, si le travail automatique est actif.

Au retour, si au moins une action a eu lieu, l'écran « Pendant votre absence »
s'ouvre.

| Ligne                | Contenu                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| Temps écoulé         | Le nombre de périodes, avec les années entre parenthèses                 |
| Argent               | La variation, avec son signe                                             |
| Stock                | La variation                                                             |
| Réputation           | La variation                                                             |
| Les événements       | Les douze plus récents, du plus récent au plus ancien                    |

Le bouton est « Reprendre ma vie », ou « Voir le bilan » si le personnage est
mort entre-temps. Si vous êtes en vie, le message « Pendant votre absence, la
croissance a continué. Elle n'a pas demandé de vos nouvelles. » est ajouté au
Courrier.

## La sauvegarde

- La partie est enregistrée **dans votre navigateur**, sur votre appareil. Un
  autre navigateur ou un autre appareil démarre sa propre partie.
- L'enregistrement est automatique : toutes les 5 secondes, quand vous changez
  d'onglet de navigateur, quand vous quittez la page, à chaque achat d'entreprise
  ou d'amélioration, à votre mort et au début d'une nouvelle vie.
- Au retour, le bouton « Reprendre » de l'écran titre rouvre la partie ; un
  rechargement de la page reste sur le même onglet du jeu.
- « Effacer la sauvegarde » (écran titre) supprime la partie, après
  confirmation. « Recommencer » et « Rejouer » écrasent la vie précédente.
- Les sauvegardes de la version 1 se chargent et sont mises à jour toutes seules
  (voir [La version 1.5](la-version-1-5.md#vos-sauvegardes-de-la-version-1)).
- Une sauvegarde illisible est ignorée : le jeu repart de l'écran titre.
- En navigation privée, ou si le navigateur refuse d'enregistrer, le jeu
  fonctionne mais ne garde rien.

Suite : [Les événements](evenements.md).
