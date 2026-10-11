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
rester lisibles. Aucune règle n'a changé : seuls `src/game/data/` et, côté
simulateur, des mesures supplémentaires (zones mortes, état à l'activation de
l'auto).

## Décisions

### Mois ou trimestre : le mois

La période reste le **mois** (684 périodes de 18 à 75 ans). Preuve : 2 188
actions manuelles pour 36 min 28 s de jeu actif, soit environ 4 s de jeu actif
par période en moyenne sur les 44 ans joués à la main, ce que v1.md visait pour
le mois. Passer au trimestre aurait demandé de changer `PERIODS_PER_YEAR` (une
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
| Carnet de notes                | 430                     | 800                   |                                     |
| Application de productivité    | 33 000                  | 25 000                |                                     |
| Premier collaborateur          | 1 600, salaire 230      | 3 000, 900            | production + 110 % (+ 50 %)         |
| Équipe de collaborateurs       | 37 000, salaire 3 600   | 30 000, 6 000         | tout + 60 % (+ 50 %)                |
| Directeur de la transformation | 310 000, salaire 45 000 | 300 000, 25 000       | tout + 300 % (+ 100 %)              |
| Procédure de travail           | 24 000                  | 20 000                |                                     |
| Tableau de bord                | 5 200                   | 5 000                 |                                     |
| Camionnette                    | 16 000                  | 7 000                 | ateliers + 15 % (+ 25 %)            |
| Plan de communication          | 19 000                  | 60 000                | ventes + 30 % (+ 25 %)              |

Raisons principales :

- **L'entrepôt est le goulot** du milieu de partie : sans lui, le chiffre
  d'affaires plafonne (stock × prix). Le grand facteur d'entrepôt (× 48) et son
  prix modéré évitent la longue panne observée avant (revenu bloqué pendant des
  dizaines de minutes).
- **Premier collaborateur tôt et peu coûteux** (27 ans) : c'est la condition de
  la phase Patron et de l'automatisation (ADR 0005 §3).
- **Les salaires des employés grimpent** (230, 3 600, 45 000 par mois) pour
  que l'embauche reste un vrai arbitrage.

### Stats, réputation, quartiers, emplois, études

| Réglage                           | Valeur retenue               | Avant            |
| --------------------------------- | ---------------------------- | ---------------- |
| Paliers de stat P1 à P4           | 2, 9, 41, 81                 | 10, 30, 70, 150  |
| Paliers de réputation             | 6, 100, 170 (gagnée cumulée) | 10, 30, 80       |
| Coût des quartiers                | 1, 22, 33                    | 5, 15, 40        |
| Salaires des emplois              | 40, 51, 250, 1 600           | 40, 70, 200, 600 |
| Coût en réputation emplois 3 et 4 | 10, 9                        | 5, 15            |
| Études (coût par action)          | 20, 150, 190, 260            | 20, 60, 150, 300 |

La réputation par vente reste 0,02. Le stage (150 €) et l'étude du Métier (20 €)
restent inchangés pour les parcours e2e. Le salaire de l'emploi 1 passe de 40 à
60 € et celui de l'emploi 2 de 51 à 76 € avec l'argent négatif (voir ci-dessous). Les
événements historiques et les indicateurs d'impact n'ont pas été modifiés : les
mesures ne l'ont pas exigé.

## Les six critères de « la v1 est finie quand… »

Mesures de `npm run sim` (valeurs ci-dessus, graine 1999), reprises par les tests
de `src/game/simulator/simulator.test.ts`.

| #   | Critère                                              | Résultat                                                                                                                                                                         | Preuve                                                                 |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Vie complète en 30 à 60 min de jeu actif             | **Atteint** : 36 min 28 s de jeu actif (2 188 actions), mort à 75 ans                                                                                                            | Test « dure entre 30 et 60 minutes de jeu actif »                      |
| 2   | Chaque phase atteinte                                | **Atteint** : jeune adulte, entrepreneur (19 ans, minute 1,5), patron (27 ans, minute 11), senior (60 ans)                                                                       | Test « atteint chaque phase de vie »                                   |
| 3   | Pas de zone morte de plus d'une minute               | **Atteint, marge faible** : plus longue 0 min 56 s (à la minute 20), aucune au-delà de 60 s, mesurée sur la durée totale (jeu actif + attente)                                    | Test « n'a pas de zone morte de plus d'une minute »                    |
| 4   | Absence rattrapée après automatisation, mort possible | **Atteint** : travail auto à 44 ans (minute 32) ; 8 h d'absence tuent le personnage, 10 min non                                                                                  | Test « laisse mourir pendant une nuit d'absence », tests de `catchUp`  |
| 5   | La sauvegarde survit à un rechargement               | **Atteint** (hors équilibrage)                                                                                                                                                   | Tests de `save`, parcours e2e « une vie »                              |
| 6   | Un simulateur confirme la durée                      | **Atteint** : il produit la courbe et ses tests reprennent les critères 1 à 4                                                                                                    | `npm run sim`, `simulator.test.ts`                                     |

Jalons du joueur virtuel : premier employé à 27 ans (minute 11), travail
automatique à 44 ans (minute 32),
quartiers à 18, 22 et 27 ans. L'ADR 0005 visait 35 à 45 ans pour l'auto.

## Limites connues

- **Marge sur la zone morte.** Le résultat (56 s) est proche de la limite de
  60 s et réagit à de petits changements de données : pendant la recherche, une
  variation d'un seul prix a fait passer la plus longue zone de 56 s à 1 min 11 s.
  Toute retouche des données demande de relancer `npm run sim`.
- **Zone morte mesurée sur la durée totale.** La vie dure 186 min d'horloge, dont
  150 min d'attente de l'auto après 44 ans (le joueur virtuel lâche la souris,
  ADR 0005 §4). Les achats y restent assez fréquents pour tenir la limite, parce
  que les entreprises (coût × 1,10 par exemplaire) restent achetables jusqu'à la
  fin ; en contrepartie le stock s'accumule (17 000 articles en fin de vie).
- **Stats gelées après l'auto.** Le joueur virtuel ne clique plus une fois le
  travail automatique actif ; seul le Métier progresse encore (marqueurs du
  travail à l'emploi). Tout palier de Gestion, d'Intelligence ou d'Endurance doit
  donc être atteint avant 44 ans. Un vrai joueur peut continuer à cliquer.
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
