# Petite enfance (0 à 5 ans)

> Statut : **proposition à discuter**. Rien n'est codé. Ce document répond à
> quatre questions : que développe-t-on à cet âge, quel gameplay, quels choix,
> quelle durée. Il pose aussi le menu **Relations**, utile dès cette tranche et
> pour toutes les suivantes. Cadre général : [tranches-de-vie.md](tranches-de-vie.md).

## Idée en une phrase

**Un bébé ne choisit ni son monde ni ses parents : il les explore.** Le joueur
développe quatre axes à deux pôles, tisse des liens avec une famille qu'il n'a pas choisie
et fait une poignée de choix qui forment un caractère. Il en sort avec des
stats, des traits et des relations qui servent à toutes les tranches suivantes.

La tranche est **courte** (6 à 8 minutes) : peu de systèmes, mais chacun pose
une brique qui reviendra plus tard (départ situationnel, traits, relations).

## 1. Le point de départ : une situation, pas un âge

Avant de jouer, le joueur ne choisit pas « un niveau » mais **une situation de
naissance**. Elle fixe la famille de départ et distribue avantages et
inconvénients. Les parents sont donc des **données**, pas du code (même principe
que l'état initial du backlog « Origines »).

Chaque situation décrit :

- les **parents** (et éventuellement fratrie, grand-parent), chacun avec ses
  qualités : *disponibilité*, *patience*, *affection*, *moyens* ;
- un **bonus et un malus de stats** de départ ;
- un **trait de départ** imposé ;
- la **voix** des événements (un même événement a une variante par situation).

| Situation        | Avantage                              | Inconvénient                           |
| ---------------- | ------------------------------------- | -------------------------------------- |
| Famille standard | Équilibrée, sert de référence         | Aucun relief (la partie « tutoriel »)  |
| Fils·fille de millionnaire | Moyens énormes, jouets, nounou | Parents absents, lien rare             |
| Fils·fille de star du rock | Éveil musical, monde sans règles | Instabilité, tournées, coucher à 4 h |
| Sans domicile fixe | Débrouillardise, parent très présent | Moyens nuls, déménagements, santé fragile |
| Parents enseignants | Langage et curiosité accélérés   | Pression, peu d'argent                 |
| Ferme / commerce familial | Motricité, grand air, grands-parents | Peu de jeux, beaucoup de travail |

Les situations s'ajoutent sans toucher aux règles. Elles se réutilisent telles
quelles pour les autres tranches (le fils de millionnaire à 12 ans) : c'est ce
qui permet des **départs situationnels** plutôt que des départs par âge.

## 2. Ce qu'on développe

### Quatre axes à deux pôles (les stats)

Chaque stat est un **axe entre deux pôles**, pas une jauge qui ne fait que
monter. Les deux pôles ont une valeur : aucun n'est « le mauvais ». Chaque
action pousse l'axe d'un côté (de −100 à +100, 0 au départ) ; plus l'axe
s'éloigne de 0, plus le pôle est marqué.

| Axe          | Pôle A                         | Pôle B                          | Ce qu'il prépare                       |
| ------------ | ------------------------------ | ------------------------------- | -------------------------------------- |
| **Énergie**  | Vif (bouge, grimpe, fonce)     | Posé (observe, attend, choisit) | Sport et endurance / patience et soin  |
| **Sociabilité** | Extraverti (appelle, rejoint) | Introverti (joue seul, écoute) | Réseau, charisme / concentration       |
| **Esprit**   | Touche-à-tout (essaie tout)    | Appliqué (répète, range, finit) | Créativité, débrouille / études, rigueur |
| **Lien**     | Câlin (cherche le contact)     | Indépendant (se débrouille)     | Relations profondes / autonomie        |

« Agile / pas agile » est rejeté (un pôle y est une insulte). Pour l'Énergie,
**Vif ↔ Posé** est la proposition ; d'autres paires possibles : *Fonceur ↔
Prudent*, *Remuant ↔ Tranquille*. Le nom se tranche au moment du texte.

**Pourquoi des axes.** À la tranche suivante, chaque axe se **transforme en
vraies stats** : la position (A ou B) choisit *quelle* stat naît, la distance à
0 en donne la valeur. Un enfant très Extraverti reçoit une stat de charisme, un
très Introverti une stat de concentration ; un enfant à 0 reçoit les deux, à
petite valeur. Le choix de chaque instant est donc déjà un choix de
personnage, sans écran de création.

Comme en v1, **un palier débloque** : en passant un seuil de l'axe (par
exemple ±25, ±50, ±75), une nouvelle action, un événement ou un trait apparaît.
Pas de bonus continu.

- Énergie : se retourner → ramper → **marcher** → courir / grimper (Vif), ou
  observer longuement → choisir son jouet → ranger (Posé).
- Sociabilité : appeler → **premiers mots** → rejoindre un groupe (Extraverti),
  ou jouer à côté → écouter → inventer un ami imaginaire (Introverti).
- Esprit : attraper → ouvrir les tiroirs → démonter (Touche-à-tout), ou empiler
  → recommencer → finir un puzzle (Appliqué).
- Lien : sourire → s'accrocher → consoler (Câlin), ou manger seul → « moi
  tout seul » → faire ses lacets (Indépendant).

### Les ressources

- **Attention** (celle des parents) : monte quand le bébé réclame (pleurer,
  sourire), descend à mesure qu'on l'emploie. Elle est la monnaie de la petite
  enfance, et la situation en fixe le rythme de recharge.
- **Patience** (des parents) : les bêtises la consomment. Vide, un parent
  « craque » (réprimande, relation qui baisse). Elle se recharge seule.

Ces deux jauges remplacent l'argent, qui n'existe pas encore. Elles sont
**liées aux relations** (§ 3), donc au contexte familial.

### Les actions : un bouton, puis des objets qui en ouvrent d'autres

**Au départ, un seul bouton** : « Gazouiller ». Il ne choisit aucun pôle : il
fait monter une jauge d'**éveil** (le compteur `growth` d'aujourd'hui) et fait
avancer la tranche. Passé quelques paliers d'éveil, les premiers événements
arrivent.

**Les événements apportent des choses autour du bébé** : un nounours, des cubes,
un hochet, un livre d'images, un ballon, un tricycle, un piano jouet, le chat de
la maison, un grand-parent qui passe. Chacun **débloque une ou deux activités**
(façon Sims) ; chaque activité pousse un axe vers un pôle.

| Objet / présence    | Activité débloquée            | Axe, pôle                     |
| ------------------- | ----------------------------- | ----------------------------- |
| Nounours            | Câliner le nounours           | Lien, Câlin                   |
| Nounours            | Lui apprendre à marcher       | Énergie, Vif                  |
| Cubes               | Empiler                       | Esprit, Appliqué              |
| Hochet / casseroles | Faire du bruit                | Sociabilité, Extraverti       |
| Livre d'images      | Regarder seul                 | Sociabilité, Introverti       |
| Ballon              | Courir après                  | Énergie, Vif                  |
| Boîte à formes      | Tout essayer dans tous les trous | Esprit, Touche-à-tout      |
| Le chat             | L'observer sans bouger        | Énergie, Posé                 |
| Un parent           | Se faire porter / marcher seul | Lien, Câlin / Indépendant    |

Un objet qui donne **deux activités de pôles opposés** (le nounours) laisse
choisir quel enfant on devient avec la même chose.

**Combien de boutons.** Le joueur a plus d'objets que de boutons : seules
**quelques activités sont « à portée de main »**, il choisit lesquelles.

- le nombre d'emplacements croît avec l'âge : **1 au départ, 2 à ~1 an, 3 à
  ~3 ans, 4 à ~5 ans** (un enfant qui grandit sait faire plus de choses à la
  fois) ;
- changer d'activité à portée est gratuit et immédiat ;
- les autres activités restent dans une liste « dans la chambre » : on n'a donc
  jamais un mur de 10 boutons, et choisir ses 3 ou 4 activités, c'est déjà
  choisir son enfant.

**Les emplacements, en clair.** Les chiffres 1, 2, 3, 4 sont le nombre de
**boutons d'activité** affichés en même temps (en plus de « Gazouiller », qui
reste toujours disponible). À 1 an, deux activités à portée ; à 3 ans, trois ;
à 5 ans, quatre. Le joueur possède souvent plus d'objets que cela, d'où le choix.

### Trouver des choses soi-même

Au début, **rien ne se trouve** : un bébé de 8 mois ne va nulle part, tout vient
des événements. Le joueur gagne ensuite deux façons d'obtenir des objets, qui
sont de **vraies actions** (elles occupent un emplacement, donc explorer, c'est
renoncer à une activité à portée).

**Explorer (à partir de 3 ans).** L'enfant marche, il est autonome : il part
fouiller la maison. Chaque appui remplit une jauge de fouille ; à 100 %, il
trouve un objet, tiré au hasard (graine de l'état) parmi les trouvailles du
lieu qu'il n'a pas encore :

- *maison* (3 ans) : pot de confiture, casseroles, télécommande, chaussures de
  papa, plante, tiroir à chaussettes. Le pot de confiture ouvre l'événement
  « Pot de confiture » (avouer / s'enfuir / partager) et consomme de la
  Patience ;
- *dehors, jardin, école* (4 à 5 ans) : bâton, escargot, ballon d'un copain,
  craies, trésor de la cour. Le champ s'élargit : l'enfant peut trouver à peu
  près n'importe quoi de fun ;
- le **contexte** de la situation ajoute ses trouvailles (coquillage à la plage,
  menu du room service à l'hôtel, médiator du père guitariste).

L'axe d'Énergie décide *où* l'enfant va : un Vif grimpe et trouve les objets
en hauteur (étagère, arbre), un Posé trouve les objets cachés (fond du tiroir,
dessous du lit). Le joueur voit à l'avance la liste des lieux, pas le contenu.

**Réclamer (à partir de 4 ans).** L'enfant sait demander ce qu'il veut. Il
choisit un objet de sa **liste de souhaits** (un vélo, un jeu de logique, un
déguisement) et un parent à qui le demander. La réponse **ne dépend pas du
hasard** mais de choses lisibles :

- le **lien** avec ce parent et ses **moyens** (le fils de millionnaire a
  presque toujours oui, l'enfant SDF presque toujours « on verra ») ;
- l'**Attention** que le joueur dépense (insister coûte, et peut user la
  Patience du parent) ;
- la réponse est **oui**, **plus tard** (l'objet arrive après un nombre
  d'événements) ou **non** (le lien baisse un peu, et l'idée de souhait reste).

L'école (4-5 ans) élargit enfin la liste de souhaits : on réclame ce qu'on a vu
chez les copains.

**Le contexte décide ce qu'on a.** L'état de départ donne ses objets (le fils de
millionnaire a dix jouets et peu de parents, l'enfant SDF a un nounours et un
parent très présent). Une même activité peut aussi se perdre (jouet cassé,
déménagement) par événement.

**Les objets sont des conditions du pool** (§ 4) : « a le nounours » éligible
pour l'événement « Le nounours perdu », « a le ballon » pour « La vitre du
voisin ». Et un événement peut **donner** ou **retirer** un objet.

Si le jeu doit rester idle, une activité à portée peut s'**automatiser** une
fois un palier d'axe passé (le bébé qui empile tout seul).

Le sommeil reste **passif** ([ADR 0007](../../.claude/adr/0007-sommeil-passif.md)) :
la sieste rend les paliers acquis « durables » et vide les marqueurs du jour,
comme à l'âge adulte. Les actions pourront s'**automatiser** (règle idle du
concept) : un bébé qui babille tout seul une fois le palier atteint.

## 3. Le menu Relations

Un nouvel onglet **Relations**, ouvert dès la petite enfance, avec un
**sous-menu** :

- **Famille** : parents, frères et sœurs, grands-parents ;
- **Amis** : vide au départ, s'ouvre quand le premier ami apparaît (événement
  vers 3 ans) ;
- plus tard : *Collègues*, *Voisins*, *Contacts*… sans changer la structure.

Tant qu'une seule section est ouverte, le sous-menu peut n'afficher que
« Famille » ; il est prévu dès maintenant pour ne pas refondre l'onglet.

### Ce qu'est une relation

Une personne a un **nom**, un **rôle** (père, mère, frère, ami…), un **lien**
(jauge de 0 à 100 qui monte et descend) et les **qualités** de la situation. Le
lien se gagne en agissant *avec* elle et se perd en l'ignorant ou en la poussant
à bout.

Apports (repris du backlog « Relations », ordre de priorité) :

1. **Bonus passifs par palier de lien** : un parent proche pousse l'axe qu'il
   aime (le parent qui lit → Extraverti). Un palier **débloque**, comme ailleurs.
2. **Soutien en cas de crise** : un lien fort amortit une mauvaise chute ou un
   mauvais choix.
3. **Déblocage d'opportunités** à la tranche suivante (un parent musicien offre
   une guitare, un grand-parent commerçant ouvre un premier petit boulot).
4. **Héritage** à terme (lien vers la vie suivante), hors périmètre ici.

Les relations sont **sérialisables** et passent d'une tranche à l'autre : c'est
le principal « acquis » avec les traits.

## 4. Les événements : un pool, tirés selon ce qui se passe

On n'écrit pas une suite d'événements fixe. On écrit un **pool** d'événements
(une vingtaine), dont la tranche **en joue quelques-uns**, tirés au hasard parmi
ceux dont les **conditions** sont remplies. Deux enfants différents ne vivent
donc pas les mêmes scènes.

### Un événement

Une donnée (`src/game/data`), comme les événements de la v1 :

- des **conditions** (toutes vraies pour être éligible) ;
- un **poids** (chance relative d'être tiré parmi les éligibles) ;
- un caractère **unique** (ne se rejoue pas) ;
- 2 ou 3 **choix**, chacun avec effet visible : un axe poussé, un lien modifié,
  parfois un trait, parfois un objet donné ou retiré.

Types de conditions prévus, tous lisibles dans l'état :

| Condition                    | Exemple                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| Âge                          | entre 2 et 3 ans                                           |
| Axe poussé d'un côté         | Énergie ≥ +25 (Vif), Sociabilité ≤ −25 (Introverti)        |
| Lien avec une personne       | lien avec la mère ≥ 50                                      |
| Trait ou événement déjà vécu | a le trait *Têtu* ; a vécu « Premier copain »              |
| **Contexte de départ** (plus tard) | situation *hôtel de luxe*, *plage*, *tournée*, *ferme* |
| Objet ou présence possédé    | a le nounours, a le ballon, le chat est là                 |
| Aucune                       | événement « de fond », éligible à tout moment              |

Le **contexte** est une étiquette de la situation de naissance (hôtel, plage,
tour bus…). Il n'est pas implémenté au début : le moteur accepte dès le départ
des conditions de n'importe quel type, les contextes viendront avec les
situations. La première MR n'a qu'âge, axe, lien et événement déjà vécu.

### Exemples du pool

| Événement                    | Conditions                      | Choix                                          |
| ---------------------------- | ------------------------------- | ---------------------------------------------- |
| Premier mot                  | âge ≈ 1 an (obligatoire)        | « Maman » / « Papa » / « Non »                 |
| L'escalier du salon          | Énergie ≥ +25, âge ≥ 1 an       | Grimper / appeler / s'asseoir                  |
| Le puzzle de 24 pièces       | Esprit ≤ −25 (Appliqué)         | Finir seul / demander de l'aide / tout renverser |
| Le camarade bruyant          | Sociabilité ≥ +25, âge ≥ 3 ans  | Le rejoindre / l'imiter / l'éviter             |
| Le coin du jardin            | Sociabilité ≤ −25               | Y rester / en parler / inviter quelqu'un       |
| La crise au supermarché      | âge ≈ 2 ans                     | Hurler / obéir / négocier                      |
| Un petit frère, une petite sœur | âge ≈ 4 ans                  | Jalousie / protéger / ignorer                  |
| Le doudou perdu              | Lien ≥ +25 (Câlin)              | Le chercher / appeler un parent / s'en passer  |
| « Moi tout seul ! »          | Lien ≤ −25 (Indépendant)        | Refuser l'aide / accepter / bouder             |
| Le dessin sur le mur         | âge ≥ 4 ans                     | Avouer / accuser le chat / recommencer plus grand |
| Le hall de l'hôtel (plus tard) | contexte *hôtel de luxe*      | Courir / se cacher / saluer le concierge       |

Les événements « d'âge » (premier mot, première rentrée) servent de jalons ; les
autres dépendent de ce que le joueur a fait de son enfant.

### Combien, et quand

Le tirage est piloté par la tranche, pas par les événements :

- **Minimum et maximum** par tranche : par exemple **4 à 7 événements** en
  petite enfance. Les valeurs sont des données de la tranche (`lifeSlices`).
- **Au plus un événement par période** (trimestre), avec un **espacement
  minimum** (par exemple 2 périodes) pour que le joueur respire.
- **À chaque période**, la tranche demande : « un événement maintenant ? ». Oui
  si le maximum n'est pas atteint, que l'espacement est respecté, et que le
  tirage passe. La probabilité monte si le minimum risque de ne pas être
  atteint ; si le nombre de périodes restantes égale le nombre d'événements
  encore dus pour le minimum, le tirage est **forcé**.
- **Choix de l'événement** : tirage pondéré parmi les éligibles. S'il n'y en a
  aucun, on passe (les événements « de fond » évitent ce cas).
- **Le hasard vient de l'état** : une graine stockée dans la sauvegarde, pas de
  `Math.random()` dans les règles. Le même état redonne le même tirage, donc le
  simulateur et les tests restent déterministes. Le hasard n'agit que sur
  *quelle scène*, jamais sur ce que rapporte un choix.

Le moteur d'événements de la v1 (`src/game/events`) est conçu autour de dates ;
il faudra voir s'il se généralise (conditions + poids + graine) ou si la
petite enfance reçoit son propre module. À trancher à la première MR du moteur.

### Les traits

Les **pôles marqués** font déjà le gros du caractère. Les **traits** viennent en
plus des choix d'événements, pour les cas qui ne se réduisent pas à un axe. Un
trait donne un **avantage et un inconvénient** (jamais l'un sans l'autre), et
on en garde **3 au plus** à la sortie, ce qui oblige à renoncer.

| Trait        | Avantage                       | Inconvénient                 |
| ------------ | ------------------------------ | ---------------------------- |
| Têtu         | Résiste à la pression          | Se fâche plus vite           |
| Tendre       | Liens qui montent plus vite    | Supporte mal la solitude     |
| Téméraire    | Progresse vite en Énergie      | Plus de chutes               |
| Rusé         | Sort des situations tendues    | Perd la confiance si on le voit |
| Artiste      | Esprit créatif                 | Désordre, peu de patience    |

## 5. Durée et rythme

**Cible : 6 à 8 minutes de jeu actif**, sur 6 années.

- Le temps avance par les actions (jauge de temps), comme dans la v1.
- Une **période = un trimestre** (24 périodes pour 6 ans), à raison d'environ
  10 secondes l'une, soit 4 minutes de jauge ; les événements et les paliers
  font le reste.
- Aucune attente de longue durée ni progression hors-ligne : la tranche se
  finit, elle ne s'étire pas.
- Fin : à 6 ans (« 5 ans révolus »), le **bilan de la petite enfance** s'affiche
  (carnet de santé, voix administrative du jeu) et propose d'entrer en Enfance.

## 6. Ton

Même règle que le reste du jeu ([ton-et-univers.md](ton-et-univers.md)) : un
monde réaliste, une voix pince-sans-rire. Les textes sont des extraits de
**carnet de santé** ou de **compte rendu de crèche** :

> « Votre enfant a prononcé son premier mot. Il s'agit de « non ». Le service
> prend acte. »

## 7. Ce que reçoit la tranche suivante

La petite enfance ne rend **ni argent ni emploi**. Elle transmet un objet de
données unique, sérialisable :

- les quatre axes (valeur finale entre −100 et +100), que la tranche suivante
  transforme en stats ;
- jusqu'à 3 traits ;
- les relations (famille, premier ami) et leur lien ;
- la situation de naissance, qui reste le contexte des tranches suivantes.

L'Enfance (6 à 12 ans) lira ce même objet ; c'est lui qui remplacera à terme le
simple compteur `growth` ([ADR 0012](../../.claude/adr/0012-tranches-de-vie.md)).

## 8. Découpage proposé (une issue = une branche = une MR)

1. **Situations de naissance** : donnée (`src/game/data`), choix à l'écran
   titre, parents et qualités. Une seule situation (« famille standard »)
   suffit pour la première MR.
2. **Axes, objets et activités** : un bouton de départ, objets, emplacements d'activité, état, reducer, paliers, jauge de temps adaptée à
   0-5 ans, remplacement du compteur `growth` pour cette tranche.
3. **Menu Relations / Famille** : onglet, sous-menu, liens, paliers et bonus.
4. **Événements et traits** : moteur de choix réutilisé de `src/game/events`,
   pool d'événements avec conditions, poids, minimum / maximum et graine ; traits et limite à 3.
5. **Bilan et passage vers l'Enfance** : écran de fin, objet transmis.
6. **Autres situations** (millionnaire, rock, SDF…) : données uniquement.

## 9. Questions ouvertes

- **Nom du pôle d'Énergie** : *Vif ↔ Posé*, *Fonceur ↔ Prudent* ou autre ?
- **Emplacements** : 1 / 2 / 3 / 4 selon l'âge, ou fixes (3) dès le début ?
- **Explorer et réclamer** prennent-ils un emplacement (choix : on renonce à
  jouer), ou sont-ils des boutons à part ?
- **Trouvailles** : le tirage au hasard est-il acceptable, ou le joueur doit-il
  voir ce qu'il va trouver ?
- **Patience / Attention** : les deux, ou une seule jauge « Attention » pour
  limiter le nombre de ressources (risque « trop d'idées d'un coup » du
  [concept](concept.md)) ?
- **Choix de la situation** : à l'écran titre (le joueur choisit) ou tirée au
  hasard (le joueur subit) ? Le choix est plus lisible, le tirage plus fidèle
  au thème.
- **Mortalité** : aucun risque de mort avant 6 ans, ou un accident possible
  (la vie du joueur s'arrête) ? On propose **aucune**.
- **Amis** : seulement le premier copain en petite enfance, ou aussi un
  compagnon (doudou, animal) ?
- **Jauge de temps** : une seule pour toute la tranche, ou une par année ?
