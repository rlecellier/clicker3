# Propositions d'équilibrage (v1.6)

> Statut : **propositions à trancher** pour la v1.6 (décision et plan : issue #153). Rien n'est appliqué dans `src/game/data/`.
> Les valeurs en vigueur et leur preuve sont dans [equilibrage.md](equilibrage.md) ;
> ce document part de mesures faites sur `main` (simulateur, graine 1999) et
> propose des axes, avec des chiffres crédibles à caler ensuite au simulateur.

Trois demandes :

1. **Des chiffres crédibles** : on n'achète pas une boutique avec 250 €.
2. **Des améliorations utiles** : un boost de sommeil ou d'apprentissage ne doit
   pas arriver quand toutes les stats sont déjà au maximum.
3. **Monter de niveau pour acheter les paliers supérieurs** : la progression
   des stats doit porter toute la vie, pas seulement les 18 premières minutes.

## 1. Diagnostic mesuré

### Les stats sont terminées à la minute 18 (sur 49)

Relevé du joueur virtuel (`npm run sim`, valeurs actuelles) :

| Minute | Âge | Événement                                     |
| -----: | --: | --------------------------------------------- |
|    0,8 |  18 | Métier P2                                     |
|    5,6 |  23 | **Gestion P4 (dernier palier)**               |
|   16,9 |  32 | Intelligence P3 (dernier palier utile)        |
|   18,1 |  33 | Endurance P3 (dernier palier utile)           |
|   18,3 |  33 | Studio rénové (sommeil × 1,5)                 |
|   27,9 |  41 | Pavillon (sommeil × 2,5)                      |
|   30,8 |  46 | Loft (sommeil × 4)                            |

Les paliers (2, 9, 41, 81 points) sont trop courts : une fois un cursus acheté,
on passe de P1 à P3 en une minute et demie. Le Directeur de la transformation
demande Gestion P4, atteinte à 23 ans, mais il s'achète à 48 ans : ce qui
bloque, c'est l'argent, pas la stat. Après la minute 18, les stats ne servent
plus à rien et le Métier finit à 2 988 points pour un dernier palier à 81.

### Sept améliorations sur douze ne servent à rien, ou presque

On a rejoué la vie en retirant une amélioration à la fois (les formations,
l'automatisation et les employés obligatoires sont gardés) :

| Amélioration retirée        | Jeu actif | Travail auto  | Recettes à 60 ans | Verdict                       |
| --------------------------- | --------: | ------------- | ----------------: | ----------------------------- |
| (aucune, référence)         |  30,6 min | 40 ans, 26,9 min |         993 000 € |                               |
| Studio rénové               |  29,9 min | 39 ans        |         990 000 € | **inutile**                   |
| Pavillon aux Tilleuls       |  30,6 min | 40 ans        |         975 000 € | **inutile**                   |
| Loft au Pôle d'Excellence   |  30,2 min | 39 ans        |       1 019 000 € | **nuisible** (loyer)          |
| Carnet de notes             |  30,7 min | 40 ans        |         971 000 € | **inutile**                   |
| Application de productivité |  29,0 min | 38 ans        |       1 035 000 € | **nuisible** (33 000 € perdus)|
| Tableau de bord             |  30,3 min | 39 ans        |         994 000 € | inutile (affichage seulement, c'est voulu) |
| Cartes de visite            |  30,4 min | 40 ans        |         978 000 € | faible, mais la zone morte passe à 80 s |
| Camionnette                 |  31,9 min | 41 ans        |         965 000 € | faible                        |
| Plan de communication       |  31,2 min | 40 ans        |         856 000 € | utile                         |
| Équipe de collaborateurs    |  30,6 min | 40 ans        |         702 000 € | utile                         |
| Étagères en kit             |  62,7 min | 71 ans        |             936 € | **indispensable**             |
| Entrepôt logistique         |  24,7 min | 39 ans        |          18 677 € | **indispensable**             |

Les trois logements (les seuls multiplicateurs de sommeil) arrivent après les
derniers paliers : c'est exactement le problème des boosts qui apparaissent
« quand on est déjà à 3 ou 4 partout ». Les deux améliorations de marqueurs
n'accélèrent presque rien : un marqueur de plus au maximum ne donne pas plus de
points, il espace seulement les sommeils (le sommeil coûte 40 de jauge, quel que
soit le nombre de marqueurs).

### Les prix ne sont pas crédibles

- **Le rapport salaire / entreprise est faux.** Une boutique coûte 250 €, moins
  d'un mois d'intérim. En 1999, un fonds de commerce de boutique vaut 40 000 à
  80 000 €, soit quatre à huit ans d'économies d'un smicard.
- **La croissance de 1,10 par exemplaire fabrique des prix absurdes.** La fin de
  vie compte 432 entreprises (109 ateliers, 103 boutiques…). Le 109ᵉ atelier coûte
  150 × 1,1¹⁰⁸ ≈ **4,4 millions d'euros pour produire 2 articles par mois** ; la
  103ᵉ boutique, 4,2 millions pour en vendre 3.
- **Les débits sont minuscules** : un atelier produit 2 articles par mois, une
  boutique en vend 3.
- **Les salaires des employés sont incohérents** : le premier collaborateur coûte
  230 €/mois (le SMIC chargé est vers 1 300 €), alors que le Directeur de la
  transformation coûte 45 000 €/mois, cinq fois ce que le personnage gagne lui-même
  comme « directeur adjoint de la transformation » (≈ 9 000 €/mois).
- **Le salaire du premier emploi est trop bas** : 60 € par action, environ
  340 €/mois pour un intérimaire (SMIC net 1999 : environ 830 €).
- **L'intérêt de la dette est usuraire** : 5 % par mois, soit 80 % par an (un
  découvert de 1999 coûte 12 à 18 % par an).
- Quelques objets : un carnet à 380 €, une « application » (en 1999) à 33 000 €,
  une camionnette de 240 000 km à 16 000 €, un hangar logistique à 31 000 €.

Ce qui est déjà crédible : le loyer du studio (300 €), les cartes de visite
(58 €), le plan de communication (19 000 €), le tableau de bord (5 200 €), la
procédure de travail (90 000 €, une certification ISO 9001 avec consultants), le
prix d'un article (12 à 15 €), et le chiffre d'affaires de fin de vie
(1,2 M€ par mois, un groupe régional).

## 2. Principes proposés

1. **Le temps de retour d'un investissement reste celui d'aujourd'hui**
   (environ 10 à 18 mois pour une paire production + commerce), car c'est lui
   qui fait le rythme mesuré au simulateur. On change l'échelle des prix et des
   débits ensemble, pas leur rapport.
2. **Le passage salaire → entreprise se fait par des marches crédibles** : une
   micro-activité d'abord (quelques milliers d'euros), puis un **apport** et un
   **crédit** pour la vraie boutique.
3. **Moins d'exemplaires, plus gros** : quelques dizaines d'établissements en fin
   de vie, pas 432. La croissance vient des améliorations et des montées en gamme.
4. **Un boost précède la stat qu'il sert** : il doit être disponible quand il
   reste au moins la moitié des points de la stat à gagner.
5. **Chaque amélioration se prouve au simulateur** : la retirer doit coûter
   quelque chose de mesurable.

## 3. Axes d'équilibrage

### Axe A — Une échelle de stats longue (8 niveaux)

Remplacer les 4 paliers (2, 9, 41, 81) par **8 niveaux** à progression
géométrique (environ × 2) :

| Niveau | 1 | 2 | 3  | 4  | 5  | 6   | 7   | 8   |
| ------ | - | - | -- | -- | -- | --- | --- | --- |
| Points | 2 | 6 | 15 | 35 | 80 | 170 | 350 | 700 |

Budget : avant l'automatisation, le joueur virtuel gagne environ 500 points au
sommeil × 1. Sans boost, on atteint le niveau 5 ou 6 dans une ou deux stats ; le
niveau 8 demande les logements et les coups de pouce (axe B). Le joueur doit
**choisir ses spécialités**, ce qui renforce le « choix de chaque instant » de la v1.

Répartition des déblocages sur toute la vie (exemple) :

| Niveau | Métier              | Gestion                                | Intelligence                   | Endurance                    |
| -----: | ------------------- | -------------------------------------- | ------------------------------ | ---------------------------- |
|      1 | Employé polyvalent  | Micro-activités                        | Agenda électronique            | Studio rénové                |
|      2 |                     | Atelier, boutique                      | Licence (cursus)               | Heures sup. (axe F)          |
|      3 | Chargé de mission   | Premier collaborateur, étagères        | Cure de ginkgo (axe B)         | Pavillon                     |
|      4 |                     | Manufacture, tableau de bord           | Assistante de direction        |                              |
|      5 |                     | Corner en hypermarché, équipe          | Séminaire intensif (axe B)     | Loft                         |
|      6 | Directeur adjoint   | Entrepôt logistique, site délocalisé   | Procédure de travail (auto)    | Heures sup. 2                |
|      7 |                     | Plateforme en ligne                    |                                | Clinique du sommeil (axe B)  |
|      8 | Mentor (prestige v2)| Directeur de la transformation         | Holding (v2)                   |                              |

Chaque achat cher a donc deux verrous : l'argent **et** un niveau. Le niveau
devient un objectif visible même quand l'argent suit.

### Axe B — Des boosts placés avant la fin de l'échelle

**Logements** (multiplicateur de sommeil) : on garde × 1,5, × 2,5, × 4, mais on
les ouvre aux niveaux 1, 3 et 5 d'Endurance, soit avant les seuils de 80, 170,
350 et 700 points où ils comptent. Le prix devient un **apport** et le loyer une
**mensualité** (voir axe D).

**Coups de pouce** (nouveau, consommables à durée limitée) : c'est la place des
« pilules d'apprentissage ». Les vraies pilules sont bon marché (une boîte de
ginkgo biloba coûtait 15 à 25 € en 1999) ; pour qu'un boost coûte cher sans
mentir, on le rattache à un service :

| Coup de pouce                        | Prix crédible            | Effet proposé                              | Durée     | Verrou            |
| ------------------------------------ | ------------------------ | ------------------------------------------ | --------- | ----------------- |
| Cure de ginkgo biloba                | 20 €, × 1,5 à chaque cure | chance de marqueur + 10 %                  | 3 mois    | Intelligence 3    |
| Séminaire intensif « Mémoire totale »| 4 500 €                  | étudier donne 2 marqueurs au lieu d'un     | 6 mois    | Intelligence 5    |
| Clinique du sommeil (Montreux)       | 25 000 € la semaine      | sommeil × 2 (en plus du logement)          | 12 mois   | Endurance 7       |
| Modafinil sans ordonnance            | 400 €/mois, réputation − | sommeil plus court (jauge − 50 %)          | tant qu'on paie | voie illégale (backlog v2) |

L'état a déjà des effets temporaires (`activeEffects`, utilisés par les
événements) : le moteur existe, il faut l'ouvrir à l'achat.

**Marqueurs** : le « +2 au maximum » ne sert presque à rien. Proposition : le
Carnet de notes devient **Agenda électronique** (un Palm Pilot coûte environ
380 € en 1999, le prix actuel devient crédible) avec « chance de marqueur
+ 30 % », ce que sa description promet déjà en plaisantant. L'Application de
productivité devient **Assistante de direction** : 1 500 € de recrutement,
1 600 €/mois de salaire, « maximum de marqueurs + 3 et sommeil 30 % plus court ».

### Axe C — Des entreprises à l'échelle réelle, en moins d'exemplaires

Deux micro-activités pour la marche d'entrée, puis les types actuels à des
prix réels. Croissance par exemplaire relevée à 1,20–1,25 et **plafond
d'exemplaires par quartier** (les quartiers prennent un rôle, comme le prévoit
le backlog). Un article vaut 12 €.

| Entreprise                | Type       | Prix du 1ᵉʳ   | Croissance | Plafond v1 | Débit / mois    | Repère réel 1999                          |
| ------------------------- | ---------- | ------------: | ---------: | ---------: | --------------- | ----------------------------------------- |
| Établi au garage          | production |       1 500 € |       1,25 |          4 | 40 articles     | outillage d'occasion                      |
| Stand au marché           | commerce   |       2 500 € |       1,25 |          4 | 50 à 12 €       | barnum, étals, droit de place             |
| Atelier d'assemblage      | production |      40 000 € |       1,20 |          8 | 600 articles    | local de 200 m², machines                 |
| Boutique                  | commerce   |      60 000 € |       1,20 |         10 | 700 à 13 €      | fonds de commerce en centre-ville         |
| Manufacture               | production |     900 000 € |       1,20 |          4 | 6 000 articles  | PME industrielle de 30 salariés           |
| Corner en hypermarché     | commerce   |     220 000 € |       1,20 |          6 | 2 500 à 12 €    | droit d'entrée et aménagement d'un rayon  |
| Site délocalisé           | production |   3 000 000 € |       1,25 |          2 | 12 000 articles | usine en Europe de l'Est                  |
| Plateforme en ligne (2000)| commerce   |   1 000 000 € |       1,25 |          3 | 8 000 à 15 €    | levée de fonds d'une start-up de 2000     |

Contrôle de cohérence : une paire atelier + boutique (100 000 €) rapporte
environ 7 800 € par mois (l'atelier limite), soit 13 mois de retour (17 aujourd'hui) ; une paire
établi + stand (4 000 €) rapporte 480 € par mois, 8 mois de retour. À plein
plafond, la vente brute est d'environ 630 000 €/mois, de 1,5 à 3 M€ avec les
multiplicateurs d'employés : le même ordre que la fin de vie actuelle.

« Hypermarché » devient « corner en hypermarché » : on n'achète pas un
hypermarché (20 à 40 M€), on y loue un rayon.

Après le plafond, la croissance passe par la **montée en gamme** : une
amélioration par type (« Boutique → enseigne », « Atelier → ligne automatisée »)
qui multiplie le débit de tous les exemplaires. C'est la mécanique « paliers de
multiplicateurs » des idle classiques, et elle remplace les 100 exemplaires.

### Axe D — Apport, crédit et charges

Pour garder le rythme avec des prix réels, l'achat se fait en **apport + crédit**,
comme dans la vraie vie :

- **Prix affiché = apport** (20 % du prix, plus frais), **mensualité** prélevée
  avec les dépenses de la période (crédit à 6 % par an sur 7 ans pour une
  entreprise, 25 ans pour un logement). La boutique s'achète avec **12 000 €
  d'apport** et coûte 700 € par mois ; le pavillon (120 000 €), 24 000 € d'apport
  et 650 € par mois.
- Le crédit se débloque par la réputation (le banquier vous connaît) : un usage
  de plus pour une ressource que l'on dépense déjà.
- Le **découvert** passe de 5 % à 1,5 % par mois (18 % par an), dans l'ordre des
  taux réels. La perte de réputation reste la vraie sanction.

Coût de développement : les logements ont déjà un `rent` ; il faut ajouter des
charges aux entreprises (un champ et une ligne dans les dépenses). La variante
la plus légère, sans crédit, garde « prix = apport » et « charges = mensualité »
en pures données.

### Axe E — Salaires, train de vie et employés

| Emploi                                | Aujourd'hui (€/action, ≈ €/mois) | Proposé (€/action, ≈ €/mois) | Repère 1999        |
| ------------------------------------- | -------------------------------: | ---------------------------: | ------------------ |
| Manutentionnaire intérimaire          |                       60 / 340   |                   150 / 900  | SMIC + prime de précarité |
| Employé polyvalent                    |                       76 / 430   |                 170 / 1 000  |                    |
| Chargé de mission                     |                    250 / 1 400   |                 330 / 2 000  | cadre débutant     |
| Directeur adjoint de la transformation|                  1 600 / 9 000   |               1 000 / 6 000  | cadre dirigeant    |

Avec un SMIC crédible, il faut une dépense crédible : un **train de vie**
(courses, transport, téléphone) d'environ 450 €/mois au studio, qui monte avec
le logement. Un intérimaire épargne alors environ 150 € par mois ; c'est l'ordre
d'aujourd'hui (40 €), et le test « dix ans d'intérim sans dette » de
`jobs.test.ts` reste la garde.

Employés au coût employeur réel : premier collaborateur 800 € de recrutement et
1 300 €/mois ; équipe de cinq, 15 000 € et 7 500 €/mois ; directeur de la
transformation, 30 000 € de cabinet de chasse et 12 000 €/mois. Leurs effets se
recalent pour garder l'arbitrage.

### Axe F — Améliorations à prix réels et effets qui comptent

| Amélioration        | Aujourd'hui                    | Proposé                                                    |
| ------------------- | ------------------------------ | ---------------------------------------------------------- |
| Stage « Posture »   | 150 €                          | 450 € (deux jours en organisme)                            |
| BTS                 | 1 500 €                        | 3 500 € (école privée, un an)                              |
| Licence             | 10 000 €                       | 6 000 € (école de commerce, un an)                         |
| Coaching            | 1 700 €                        | 2 500 € (dix séances)                                      |
| Studio rénové       | 7 500 €, loyer + 34 €          | 800 € (caution et frais d'agence), loyer + 80 €            |
| Pavillon            | 100 000 €, + 380 €             | 24 000 € d'apport, mensualité 650 €                        |
| Loft                | 190 000 €, + 500 €             | 70 000 € d'apport (prix 350 000 €), mensualité 1 800 €                      |
| Étagères en kit     | 2 900 €, capacité × 13         | 2 500 €, + 1 500 articles (valeur absolue, plus lisible)   |
| Entrepôt logistique | 31 000 €, capacité × 48        | 30 000 € (bail et aménagement), loyer 2 500 €/mois, + 60 000 articles |
| Petit entrepôt      | 100 €, + 25 articles           | conteneur d'occasion 1 800 €, + 500 articles               |
| Camionnette         | 16 000 €, ateliers + 15 %      | 6 000 € (240 000 km), stands et boutiques + 20 % de débit  |
| Heures sup. (nouveau)| —                             | Endurance 2 et 6 : le travail rapporte + 25 % pour + 20 % de jauge |

Les micro-activités demandent de baisser la marche d'entrée des étagères et du
premier collaborateur ; le simulateur dira où les placer.

## 4. Garde-fous à ajouter au simulateur et aux tests

Pour que ces règles restent vraies après chaque retouche :

1. **Test d'utilité** (simulateur) : retirer une amélioration doit dégrader une
   mesure d'au moins 5 % (âge du travail automatique, recettes à 60 ans ou durée
   de jeu actif). Le tableau de bord est exempté (affichage).
2. **Part utile d'un boost** : pour chaque logement et coup de pouce, au moins
   50 % des points de stat de la vie sont gagnés **après** son achat.
3. **Stats vivantes** : le dernier niveau d'au moins une stat est atteint après
   la minute 25.
4. **Crédibilité des données** (`data.test.ts`) : salaire mensuel d'un emploi
   entre 800 et 8 000 €, aucun exemplaire d'entreprise au-delà de 10 fois son
   prix de base, coût d'un employé au moins égal au SMIC chargé.

## 5. Ordre proposé

Une issue par axe, dans cet ordre, en relançant `npm run sim` à chaque fois :

1. **A + B (stats longues et boosts placés)** : données surtout, plus le test
   d'utilité. C'est le plus gros gain de jeu pour le moins de code.
2. **E (salaires, train de vie, employés)** : données, plus une dépense.
3. **C + D (entreprises réelles, apport et charges)** : règles (charges, plafond
   par quartier, montée en gamme) et recalage complet au simulateur.
4. **F (améliorations)** : finitions, une fois l'échelle posée.
5. Coups de pouce illégaux et crédit avancé : avec la voie illégale du backlog (v2).

Risques : les critères de la v1 ont peu de marge (30 min 37 s de jeu actif,
zone morte de 59 s). Toute proposition passe par le simulateur avant d'être
retenue, et ce document sera remplacé par les valeurs prouvées dans
[equilibrage.md](equilibrage.md).
