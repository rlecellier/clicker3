# Petite enfance (0 à 5 ans)

> Statut : **proposition à discuter**. Rien n'est codé. Ce document répond à
> quatre questions : que développe-t-on à cet âge, quel gameplay, quels choix,
> quelle durée. Il pose aussi le menu **Relations**, utile dès cette tranche et
> pour toutes les suivantes. Cadre général : [tranches-de-vie.md](tranches-de-vie.md).

## Idée en une phrase

**Un bébé ne choisit ni son monde ni ses parents : il les explore.** Le joueur
développe quatre éveils, tisse des liens avec une famille qu'il n'a pas choisie
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

### Quatre éveils (les stats)

Ils montent par l'action, jamais par le hasard (le joueur voit ce qu'il gagne).

| Éveil         | Ce que c'est                | Prépare surtout                          |
| ------------- | --------------------------- | ---------------------------------------- |
| **Corps**     | Motricité, équilibre, santé | Sport, résistance, travail physique      |
| **Parole**    | Babil, mots, phrases        | Études, négociation, relations           |
| **Curiosité** | Toucher, comprendre         | Études, créativité, débrouille           |
| **Attachement** | Confiance, émotions       | Qualité des relations, moral             |

Comme en v1, **un palier débloque** : à chaque seuil, une nouvelle action ou un
nouvel événement apparaît. Pas de bonus continu.

- Corps : se retourner → ramper → **marcher** → courir / grimper.
- Parole : babiller → **premiers mots** → phrases → poser des questions.
- Curiosité : attraper → mettre à la bouche → ouvrir les tiroirs → démonter.
- Attachement : sourire → s'accrocher → faire un câlin → consoler.

### Les ressources

- **Attention** (celle des parents) : monte quand le bébé réclame (pleurer,
  sourire), descend à mesure qu'on l'emploie. Elle est la monnaie de la petite
  enfance, et la situation en fixe le rythme de recharge.
- **Patience** (des parents) : les bêtises la consomment. Vide, un parent
  « craque » (réprimande, relation qui baisse). Elle se recharge seule.

Ces deux jauges remplacent l'argent, qui n'existe pas encore. Elles sont
**liées aux relations** (§ 3), donc au contexte familial.

### Les actions (le bouton devient un petit choix)

Aujourd'hui l'onglet Vie n'a qu'un bouton « Gazouiller ». On propose **4 à 5
actions**, qui se débloquent peu à peu :

| Action               | Effet principal                          | Coût / risque               |
| -------------------- | ---------------------------------------- | --------------------------- |
| Gazouiller / Parler  | Parole, un peu d'Attachement             | Aucun                       |
| Bouger (ramper, marcher) | Corps                                | Petit risque de chute       |
| Fouiller / Toucher à tout | Curiosité                           | Consomme la Patience        |
| Câliner / Sourire    | Attachement, Attention gagnée            | Aucun                       |
| Faire une bêtise     | Curiosité forte, déclenche un événement  | Patience, lien qui baisse   |

Le sommeil reste **passif** ([ADR 0007](../../.claude/adr/0007-sommeil-passif.md)) :
la sieste rend les éveils acquis « durables » et vide les marqueurs du jour,
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

1. **Bonus passifs par palier de lien** : un parent proche accélère l'éveil qu'il
   aime (le parent qui lit → Parole). Un palier **débloque**, comme ailleurs.
2. **Soutien en cas de crise** : un lien fort amortit une mauvaise chute ou un
   mauvais choix.
3. **Déblocage d'opportunités** à la tranche suivante (un parent musicien offre
   une guitare, un grand-parent commerçant ouvre un premier petit boulot).
4. **Héritage** à terme (lien vers la vie suivante), hors périmètre ici.

Les relations sont **sérialisables** et passent d'une tranche à l'autre : c'est
le principal « acquis » avec les traits.

## 4. Les événements : des choix qui forment un caractère

Cinq à six événements, déclenchés par **seuils d'âge ou d'éveil**, uniques.
Chacun propose 2 ou 3 réponses, **chacune avec un coût et un gain visibles**
(pas de piège caché). Chaque réponse modifie un éveil, un lien et parfois donne
un **trait**.

| Âge | Événement                          | Choix possibles                                                         |
| --- | ---------------------------------- | ----------------------------------------------------------------------- |
| ~1 an | **Premier mot**                  | « Maman » / « Papa » / « Non » → lien vers un parent, ou trait *Têtu*    |
| ~1-2 | **Premiers pas**                  | Vers le parent (Attachement) / vers la prise (Curiosité, risque) / vers le chat (trait *Tendre*) |
| ~2 ans | **La crise au supermarché**     | Hurler (Attention, Patience en baisse) / obéir / négocier (Parole)       |
| ~3 ans | **Le premier copain**           | Partager le jouet / le garder / le casser → **ouvre l'onglet Amis**      |
| ~4 ans | **Un petit frère ou une petite sœur** | Jalousie / protéger / ignorer → lien, trait *Protecteur* ou *Solitaire* |
| ~5 ans | **Le dessin sur le mur**        | Avouer / accuser le chat / recommencer plus grand → trait *Honnête*, *Rusé* ou *Artiste* |

La situation **recolore** l'événement (le supermarché devient un tour bus, un
foyer d'accueil, un restaurant étoilé) sans changer ses choix.

### Les traits

Un trait donne un **avantage et un inconvénient** (jamais l'un sans l'autre),
conformément à l'esprit « départs situationnels » : on en garde **3 au plus**
à la sortie, ce qui oblige à renoncer.

| Trait        | Avantage                       | Inconvénient                 |
| ------------ | ------------------------------ | ---------------------------- |
| Têtu         | Résiste à la pression          | Se fâche plus vite           |
| Câlin        | Liens qui montent plus vite    | Supporte mal la solitude     |
| Fonceur      | Corps et Curiosité accélérés   | Plus de chutes               |
| Timide       | Observe, Parole stable         | Premier ami plus tardif      |
| Rusé         | Sort des situations tendues    | Perd la confiance si on le voit |

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

- les quatre éveils (valeurs finales) ;
- jusqu'à 3 traits ;
- les relations (famille, premier ami) et leur lien ;
- la situation de naissance, qui reste le contexte des tranches suivantes.

L'Enfance (6 à 12 ans) lira ce même objet ; c'est lui qui remplacera à terme le
simple compteur `growth` ([ADR 0012](../../.claude/adr/0012-tranches-de-vie.md)).

## 8. Découpage proposé (une issue = une branche = une MR)

1. **Situations de naissance** : donnée (`src/game/data`), choix à l'écran
   titre, parents et qualités. Une seule situation (« famille standard »)
   suffit pour la première MR.
2. **Éveils et actions** : état, reducer, paliers, jauge de temps adaptée à
   0-5 ans, remplacement du compteur `growth` pour cette tranche.
3. **Menu Relations / Famille** : onglet, sous-menu, liens, paliers et bonus.
4. **Événements et traits** : moteur de choix réutilisé de `src/game/events`,
   les six événements, trait et limite à 3.
5. **Bilan et passage vers l'Enfance** : écran de fin, objet transmis.
6. **Autres situations** (millionnaire, rock, SDF…) : données uniquement.

## 9. Questions ouvertes

- **Combien d'actions** au départ ? On propose 5 ; 3 suffiraient si on veut
  une tranche encore plus courte.
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
