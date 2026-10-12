# Équilibrage de la v1

> Statut : **fait** (V1-24, issue #28). Les valeurs vivent dans `src/game/data/` ;
> ce document garde les valeurs retenues, leur justification et la preuve par le
> simulateur ([simulateur.md](simulateur.md)). Les prix de
> [ameliorations-et-evenements.md](ameliorations-et-evenements.md) sont des ordres
> de grandeur de conception : en cas d'écart, les données et ce document font foi.

## Méthode

Le simulateur (`npm run sim`) joue une vie avec le joueur virtuel déterministe.
Les chiffres ont été cherchés par recherche aléatoire guidée (recuit simulé) sur
les données, avec comme objectif les critères de [v1.md § 10](v1.md#10-la-v1-est-finie-quand) :
jeu actif entre 30 et 60 min, travail automatique entre 35 et 45 ans, aucune
zone morte au-delà d'une minute, mort possible pendant une nuit d'absence. Les
valeurs sont bornées (de ⅓ à 3 fois le point de départ), arrondies à deux chiffres
significatifs et pénalisées quand elles s'éloignent du point de départ, pour
rester lisibles. Pendant V1-24, aucune règle n'a changé : seuls `src/game/data/`
et, côté simulateur, des mesures supplémentaires (zones mortes, état à
l'activation de l'auto). Les règles changées depuis (argent négatif, vente avant
le plafond d'entrepôt) sont décrites en fin de document.

## Décisions

### Mois ou trimestre : le mois

La période reste le **mois** (684 périodes de 18 à 75 ans). Preuve au moment de
V1-24 : 2 188 actions manuelles pour 36 min 28 s de jeu actif, soit environ 4 s
de jeu actif par période en moyenne sur les 44 ans joués à la main, ce que v1.md
visait pour le mois. Au dernier relevé, une période dure environ 6 s avant
l'automatisation (environ 26,6 minutes pour les 264 mois de 18 à 40 ans). Passer au trimestre aurait demandé de changer `PERIODS_PER_YEAR` (une
règle) sans bénéfice mesuré.

### Jauge de temps : 70 au lieu de 100

Une période demande 7 actions de travail (10 avant). C'est le levier principal :
avec 10 actions par période, la vie dépassait 90 min de jeu actif ; avec 30 à 40
de jauge, la vie devenait trop courte pour la cible de 30 min. Une action
automatique (deux par seconde, ADR 0005) fait passer une période en 3,5 s.

### Rendement de l'auto : inchangé

`speedFactor` passe à 2 (deux actions par seconde, ADR 0005, issue #67) et `yieldFactor` reste ½ (« moitié moins »,
v1.md § 6). Une version intermédiaire à 0,35 satisfaisait aussi les critères, mais
rien ne la justifiait par rapport à la règle écrite.

### Entreprises (croissance 1,10 partout)

| Entreprise           | Type       | Coût de base | Production ou capacité | Prix | Avant (coût, débit) |
| -------------------- | ---------- | ------------ | ---------------------- | ---- | ------------------- |
| Atelier d'assemblage | production | 150          | 2                      |      | 200, 4              |
| Boutique             | commerce   | 250          | 3                      | 12   | 300, 4              |
| Manufacture          | production | 13 000       | 99                     |      | 4 000, 40           |
| Hypermarché          | commerce   | 13 000       | 87                     | 13   | 6 000, 45           |
| Site délocalisé      | production | 53 000       | 210                    |      | 80 000, 500         |
| Plateforme en ligne  | commerce   | 66 000       | 250                    | 15   | 120 000, 600        |

Justification : la croissance 1,10 (au lieu de 1,12 à 1,15 pour les grosses) garde
un achat à portée tout au long de la vie ; les coûts de base montent par un
facteur 50 à 100 d'un type à l'autre pour que chaque type prenne le relais du
précédent quand celui-ci devient trop cher.

### Améliorations

| Amélioration                   | Prix                    | Avant                 | Autre changement                    |
| ------------------------------ | ----------------------- | --------------------- | ----------------------------------- |
| Cartes de visite               | 58                      | 100                   |                                     |
| BTS                            | 1 500                   | 1 500                 |                                     |
| Licence d'économie             | 10 000                  | 6 000                 |                                     |
| Coaching                       | 1 700                   | 12 000                |                                     |
| Studio rénové                  | 7 500, loyer +34        | 4 000, +150           |                                     |
| Pavillon                       | 100 000, +380           | 40 000, +600          |                                     |
| Loft                           | 190 000, +500           | 400 000, +3 000       |                                     |
| Étagères en kit                | 2 900                   | 2 000                 | capacité × 13 (× 2 avant)           |
| Entrepôt logistique            | 31 000                  | 80 000                | capacité × 48 (× 5 avant)           |
| Carnet de notes                | 380                     | 800                   |                                     |
| Application de productivité    | 33 000                  | 25 000                |                                     |
| Premier collaborateur          | 1 600, salaire 230      | 3 000, 900            | production + 110 % (+ 50 %)         |
| Équipe de collaborateurs       | 37 000, salaire 3 600   | 30 000, 6 000         | tout + 60 % (+ 50 %)                |
| Directeur de la transformation | 310 000, salaire 45 000 | 300 000, 25 000       | tout + 300 % (+ 100 %)              |
| Procédure de travail           | 90 000                  | 20 000                |                                     |
| Tableau de bord                | 5 200                   | 5 000                 |                                     |
| Camionnette                    | 16 000                  | 7 000                 | ateliers + 15 % (+ 25 %)            |
| Plan de communication          | 19 000                  | 60 000                | ventes + 30 % (+ 25 %)              |

Raisons principales :

- **L'entrepôt est le goulot** du milieu de partie : sans lui, le chiffre
  d'affaires plafonne (stock × prix). Le grand facteur d'entrepôt (× 48) et son
  prix modéré évitent la longue panne observée avant (revenu bloqué pendant des
  dizaines de minutes).
- **Premier collaborateur tôt et peu coûteux** (25 ans) : c'est la condition de
  la phase Patron et de l'automatisation (ADR 0005 §3).
- **Procédure de travail chère** (90 000) : depuis que la production est
  vendue avant le plafond d'entrepôt, la partie passait sous les 30 minutes de
  jeu actif ; l'automatisation arrive donc plus tard.
- **Les salaires des employés grimpent** (230, 3 600, 45 000 par mois) pour
  que l'embauche reste un vrai arbitrage.

### Stats, réputation, quartiers, emplois, études

| Réglage                           | Valeur retenue               | Avant            |
| --------------------------------- | ---------------------------- | ---------------- |
| Paliers de stat P1 à P4           | 2, 9, 41, 81                 | 10, 30, 70, 150  |
| Paliers de réputation             | 6, 100, 170 (gagnée cumulée) | 10, 30, 80       |
| Coût des quartiers                | 1, 22, 33                    | 5, 15, 40        |
| Salaires des emplois              | 60, 80, 250, 1 600           | 40, 70, 200, 600 |
| Coût en réputation emplois 3 et 4 | 10, 9                        | 5, 15            |
| Études (coût par action)          | 20, 150, 190, 260            | 20, 60, 150, 300 |

La réputation par vente reste 0,02. Le stage (150 €) et l'étude du Métier (20 €)
restent inchangés pour les parcours e2e. Le salaire de l'emploi 1 passe de 40 à
60 € et celui de l'emploi 2 de 51 à 80 € avec l'argent négatif (voir ci-dessous). Les
événements historiques et les indicateurs d'impact n'ont pas été modifiés : les
mesures ne l'ont pas exigé.

## Les six critères de « la v1 est finie quand… »

Mesures de `npm run sim` (valeurs ci-dessus, graine 1999, dernier relevé après
la vente avant plafond d'entrepôt), reprises par les tests
de `src/game/simulator/simulator.test.ts`.

| #   | Critère                                              | Résultat                                                                                                                                                                         | Preuve                                                                 |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Vie complète en 30 à 60 min de jeu actif             | **Atteint, marge faible** : 30 min 37 s de jeu actif (1 837 actions), mort à 75 ans                                                                                              | Test « dure entre 30 et 60 minutes de jeu actif »                      |
| 2   | Chaque phase atteinte                                | **Atteint** : jeune adulte, entrepreneur (19 ans, minute 1,3), patron (25 ans, minute 9), senior (60 ans)                                                                        | Test « atteint chaque phase de vie »                                   |
| 3   | Pas de zone morte de plus d'une minute               | **Atteint, marge faible** : plus longue 0 min 59 s (à la minute 7,7), aucune au-delà de 60 s, mesurée sur la durée totale (jeu actif + attente)                                   | Test « n'a pas de zone morte de plus d'une minute »                    |
| 4   | Absence rattrapée après automatisation, mort possible | **Atteint** : travail auto à 40 ans (minute 27) ; 8 h d'absence tuent le personnage, 10 min non                                                                                  | Test « laisse mourir pendant une nuit d'absence », tests de `catchUp`  |
| 5   | La sauvegarde survit à un rechargement               | **Atteint** (hors équilibrage)                                                                                                                                                   | Tests de `save`, parcours e2e « une vie »                              |
| 6   | Un simulateur confirme la durée                      | **Atteint** : il produit la courbe et ses tests reprennent les critères 1 à 4                                                                                                    | `npm run sim`, `simulator.test.ts`                                     |

Jalons du joueur virtuel : premier employé à 25 ans (minute 9), travail
automatique à 40 ans (minute 27), quartiers à 18, 22 et 25 ans. L'ADR 0005 visait 35 à 45 ans pour l'auto.

## Limites connues

- **Marge sur la durée.** Le jeu actif (30 min 37 s) touche presque le bas de
  la cible de 30 minutes.
- **Marge sur la zone morte.** Le résultat (59 s) est proche de la limite de
  60 s et réagit à de petits changements de données : pendant la recherche, une
  variation d'un seul prix a fait passer la plus longue zone de 56 s à 1 min 11 s.
  Toute retouche des données demande de relancer `npm run sim`.
- **Zone morte mesurée sur la durée totale.** La vie dure 49 min d'horloge, dont
  19 min d'attente de l'auto après 40 ans (le joueur virtuel lâche la souris,
  ADR 0005 §4). Les achats y restent assez fréquents pour tenir la limite, parce
  que les entreprises (coût × 1,10 par exemplaire) restent achetables jusqu'à la
  fin ; en contrepartie le stock s'accumule (31 200 articles en fin de vie).
- **Stats gelées après l'auto.** Le joueur virtuel ne clique plus une fois le
  travail automatique actif ; seul le Métier progresse encore (marqueurs du
  travail à l'emploi). Tout palier de Gestion, d'Intelligence ou d'Endurance doit
  donc être atteint avant 40 ans. Un vrai joueur peut continuer à cliquer.
- **Playtest humain** : tout est mesuré au simulateur. Le rythme ressenti (une
  période de 4 s) et la lisibilité du prochain achat restent à valider en jouant.

## Argent négatif et premier emploi (issue #88)

L'argent peut descendre sous 0 : le loyer et les salaires sont prélevés en
entier, un solde négatif après les dépenses est un impayé (perte de
réputation) et un solde négatif porte **5 % d'intérêt par période**
(`economyRules.debtInterestRate`, arrondi à l'euro supérieur). On ne peut rien
acheter à découvert (entreprise, amélioration, étude).

Le premier emploi doit permettre de **vivre sans dette en ne faisant que
travailler**, sommeil compris : un sommeil complet coûte 40 de jauge sans
salaire, soit environ 5,7 salaires par période et non 7. L'intérim passe donc
de 40 à 60 € (≈ 340 € par mois pour 300 € de loyer) et l'emploi 2 de 51 à
76 € pour rester meilleur. Un test (`jobs.test.ts`) joue dix ans d'intérim sans
jamais passer sous 0. Le joueur virtuel garde un quart de mois de dépenses
fixes en caisse avant d'acheter.

## Vérification de la v1.5 (issue #108)

- 2026-10-12 — v1.5 (comparaison refaite, tous les changements de `src/game/`
  inclus) : sortie du simulateur inchangée. `npm run sim` (graine 1999) sur
  `main` (`7a7832b`) et sur le dernier commit avant #97 (`e8cd2a1`, extrait
  dans un dossier séparé) donne exactement la même sortie, rapport et courbe
  CSV (`--csv`) compris, comparés octet à octet : 30 min 37 s de jeu actif,
  plus longue zone morte 0 min 59 s, 1 837 actions. Les changements de
  `src/game/` depuis `e8cd2a1` sont des refontes ou des ajouts sans effet sur
  l'équilibrage : #112 (historique du ledger, sauvegarde version 8), #125
  (valeurs finales d'entreprise extraites dans `economy.ts`), #129 (`canStudy`
  refuse un cursus dont la stat est au dernier palier, ce que le simulateur
  n'atteint pas), #122 (`statProgress`), ainsi que le courrier, les nouveautés
  par onglet (sauvegarde version 7), la progression du palier de réputation et
  la description chiffrée des améliorations. #116 (appui maintenu) ne touche
  pas `src/game/`. Une sauvegarde réelle de la v1 (version 5) traverse les
  migrations jusqu'à la version 8 (`save.test.ts`).

## Valeurs dérivées des améliorations (issue #176)

- 2026-10-12 — Les multiplicateurs, la capacité de stock, les marqueurs
  maximum, le logement, le loyer et les salaires ne sont plus modifiés à
  l'achat puis « défaits » à l'annulation par l'opération inverse : ils sont
  recalculés depuis l'état de départ, les améliorations possédées, les petits
  entrepôts et deux facteurs d'événements (`rentFactor`, `payrollFactor`),
  par `withModifiers` (`@game/upgrades`). Cela corrige deux bugs : un loyer
  faux après une hausse puis l'annulation d'un logement (317 € au lieu de
  315 €), et une capacité de stock non entière après l'annulation des
  étagères (51,92). Deux règles changent :
  - la capacité vaut (50 + 25 × petits entrepôts) × agrandissements : un petit
    entrepôt acheté après les étagères est maintenant agrandi lui aussi ;
  - une hausse de loyer ou de salaires s'applique aussi aux logements et
    employés pris ensuite.

  `npm run sim` (graine 1999), avant → après : jeu actif 30 min 49 s →
  30 min 43 s (1 849 → 1 843 actions), attente 18 min 42 s → 18 min 43 s,
  plus longue zone morte 1 min 00 s (inchangée, à la minute 15,4), aucune zone
  morte au-delà d'une minute, travail automatique à 40 ans (minute 27,1) →
  39 ans (minute 26,9). Phases et quartiers aux mêmes âges. Sauvegarde en
  version 10 : la migration garde le loyer et les salaires (elle en déduit les
  facteurs d'événements) et la capacité de stock ne peut que grandir
  (`save.test.ts`).

## Garde-fous du simulateur (issue #164)

- 2026-10-12 — `npm run sim` affiche, après la courbe, trois contrôles
  (`src/game/simulator/guardrails.ts`, décisions de
  [propositions-equilibrage.md](propositions-equilibrage.md) § 4) :
  1. **Utilité** : on rejoue la vie sans une amélioration (le joueur virtuel ne
     l'achète jamais) ; elle doit dégrader d'au moins 5 % l'âge du travail
     automatique, les recettes à 60 ans ou la durée de jeu active. Exemptés :
     les formations, l'automatisation, le tableau de bord, le premier
     collaborateur et le directeur de la transformation.
  2. **Part utile d'un boost** (les logements pour l'instant) : au moins 50 %
     des points de stat de la vie sont gagnés après son achat. On compte les
     points **utiles**, plafonnés au dernier palier de chaque stat : un point
     au-delà ne débloque rien (le Métier finit à 2 988 points pour un dernier
     palier à 81).
  3. **Stats vivantes** : le dernier palier d'au moins une stat est atteint
     après la minute 25.

  Sortie sur les valeurs actuelles (graine 1999), qui confirme le diagnostic :

  | Contrôle                          | Résultat                               |
  | --------------------------------- | -------------------------------------- |
  | Utilité du studio rénové          | échec (travail auto −2,6 %, recettes −0,6 %) |
  | Utilité du pavillon               | échec (aucun écart)                    |
  | Utilité du loft                   | échec, nuisible (−5,1 % : il retarde le jeu) |
  | Utilité du carnet de notes        | échec (aucun écart)                    |
  | Utilité de l'application          | échec, nuisible (−2,8 % de recettes)   |
  | Utilité des cartes de visite      | échec (aucun écart)                    |
  | Boost : studio rénové             | échec, 15,6 % des points après l'achat |
  | Boost : pavillon, loft            | échec, 0 % des points après l'achat    |
  | Utilité des étagères, de l'entrepôt, de l'équipe, de la camionnette, du plan de communication | réussi |
  | Stats vivantes                    | **réussi** : dernier palier à la minute 28,0 |

  Écart au diagnostic : le contrôle « stats vivantes » réussit déjà, parce
  qu'une stat atteint son dernier palier (P4) à la minute 28 ; seuls les
  paliers *utiles* aux achats étaient finis à la minute 18. Il restera là pour
  empêcher une régression avec les 8 niveaux de l'axe A.

  Les échecs connus sont listés dans `knownGuardrailFailures`
  (`src/game/simulator/config.ts`) et affichés « CONNU » ; le test exige que les
  échecs soient exactement cette liste, donc chaque chantier d'équilibrage doit
  en retirer ceux qu'il corrige. Aucune donnée de `src/game/data/` n'a changé.

## Stats sur 8 niveaux et boosts (issue #165)

- 2026-10-12 — Axe A + B de [propositions-equilibrage.md](propositions-equilibrage.md).

**Niveaux.** Les paliers 2, 9, 41, 81 deviennent 2, 6, 15, 35, 80, 170, 350 et
700 points (`statTierThresholds`). Déblocages retenus (niveau de stat requis) :

| Niveau | Métier | Gestion | Intelligence | Endurance |
| -----: | ------ | ------- | ------------ | --------- |
| 1 | Employé polyvalent, BTS | Licence | Agenda électronique, Coaching | Studio rénové |
| 2 | | Atelier, Boutique | | |
| 3 | Chargé de mission | Étagères, Premier collaborateur | Cure de ginkgo | Pavillon |
| 4 | | Manufacture, Tableau de bord | Assistante de direction | |
| 5 | | Hypermarché, Équipe | Séminaire intensif | Loft, Clinique du sommeil |
| 6 | Directeur adjoint | Entrepôt logistique, Site délocalisé | | |
| 7 | | Plateforme en ligne | | Procédure de travail |
| 8 | Procédure de travail | Directeur de la transformation, Procédure de travail | Procédure de travail | |

Écarts à la proposition : la procédure de travail (automatisme) demande les
quatre stats presque au maximum (Métier, Gestion, Intelligence 8, Endurance 7) ;
sans cela, l'auto arrivait à 37 ans et le jeu actif tombait sous 30 minutes. La
clinique du sommeil s'ouvre à Endurance 5 et non 7 : au niveau 7, le joueur
virtuel ne l'atteignait pas avant l'automatisation.

**Boosts.** Logements ouverts aux niveaux 1, 3 et 5 d'Endurance, à 7 500,
30 000 (avant 100 000) et 80 000 € (avant 190 000) ; coups de pouce achetables
(`activeEffects`, action `buyBoost`) : cure de ginkgo (20 €, 3 mois, chance de
marqueur +10 %), séminaire intensif (4 500 €, 6 mois, deux chances de marqueur
par étude), clinique du sommeil (25 000 €, 12 mois, sommeil ×2). Le prix reste
fixe (pas de ×1,5 par cure). Carnet de notes → **Agenda électronique** (chance
de marqueur +30 %, 380 €). Application de productivité → **Assistante de
direction** (1 500 €, salaire 800 €/mois, production et ventes +30 %) : sa
version « marqueurs maximum +3 et sommeil plus court » était nuisible au
simulateur (un cerveau plus grand et un sommeil plus court espacent ou
raccourcissent le sommeil, qui fait passer le temps sans clic : plus de jeu
actif pour rien). Procédure de travail : 160 000 € (avant 90 000).

**Simulateur.** Le joueur virtuel n'étudie plus quand un achat moins cher
n'attend que l'argent (sinon il épuisait sa caisse en études pour des niveaux
lointains) et achète les coups de pouce tant qu'ils servent.

**Mesures** (`npm run sim`, graine 1999), avant → après :

| Mesure | Avant | Après |
| ------ | ----- | ----- |
| Jeu actif | 30 min 43 s | 31 min 13 s |
| Plus longue zone morte | 1 min 00 s | 0 min 52 s |
| Travail automatique | 39 ans, minute 26,9 | 41 ans, minute 28,6 |
| Dernier niveau d'une stat | minute 28,0 (palier 4) | minute 28,5 (niveau 8) |
| Part des points après l'achat : studio, pavillon, loft | 15,6 %, 0 %, 0 % | 89,9 %, 82,6 %, 72,5 % |
| Part pour ginkgo, séminaire, clinique | n/a | 91,1 %, 69,2 %, 75,5 % |

Garde-fous : tous les contrôles de boost et de stats vivantes réussissent. Utilité
réussie pour le loft, l'assistante, les étagères, l'entrepôt, l'équipe et le plan
de communication. Encore en échec (listés dans `knownGuardrailFailures`) :
studio rénové, pavillon (un multiplicateur de plus ou de moins ne change ni
l'âge de l'auto ni les recettes au-delà du bruit de ±2 % de la mesure),
agenda électronique (4,x % : le séminaire et la cure couvrent déjà la chance de
marqueur), cartes de visite et camionnette (hors périmètre). La mesure d'utilité
est discrète (un an d'âge d'auto vaut 2,4 %) : un changement de données quelque
part déplace ces cas limites.

Sauvegarde en version 12 : les deux améliorations renommées sont migrées
(identifiants, nouveautés vues), les points de stat sont gardés ; les coups de
pouce n'ajoutent aucun champ (nouveaux genres d'`activeEffects`).
