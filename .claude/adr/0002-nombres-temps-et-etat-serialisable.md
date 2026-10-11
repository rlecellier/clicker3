# ADR 0002 — Nombres, temps et état sérialisable

- **Statut** : accepté
- **Date** : 2026-10-11

## Contexte

Les règles du jeu (`src/game/`) doivent être testables sans navigateur,
rejouables (absence, simulateur) et sauvegardables. Il faut fixer comment on
représente les nombres, l'argent et le temps.

## Décision

### 1. Nombres : `number` JS

La v1 reste dans des ordres de grandeur réalistes (millions, milliards d'euros
d'une ville). Un `number` (double IEEE 754, entiers exacts jusqu'à 2^53) suffit.
Pas de type « grand nombre » ni de `bigint`. La croissance vient des
multiplicateurs achetés, pas de l'explosion exponentielle.

### 2. Argent : euros entiers

`money` est un nombre entier d'euros. Toute formule qui produit une fraction
(coût `coûtBase × croissance ^ possédés`, ventes, multiplicateurs) arrondit
**une seule fois, au calcul du montant**, avec la fonction d'arrondi prévue pour
cela dans les règles, jamais en cours de calcul. Pas de centimes en v1 : les
montants restent lisibles et la comparaison `money >= coût` est exacte.

### 3. État sérialisable

`GameState` ne contient que des types JSON : nombres, chaînes, booléens,
tableaux et objets simples. Pas de `Date`, `Map`, `Set`, fonction, `undefined`
ni `NaN`. Garantie testée : `JSON.parse(JSON.stringify(state))` est égal à
`state`. La sauvegarde et le rattrapage d'absence en dépendent.

### 4. Le temps vient de l'état

- Le temps de jeu est `period` (compteur de périodes, une période = un mois) et
  `gauge` (remplissage de la jauge de temps).
- L'âge et la date **se dérivent** de `period` et des données de départ
  (`ageOf`, `dateOf`) ; on ne les stocke pas.
- Aucune règle n'appelle `Date.now()` ni `Math.random()`. Le hasard viendra
  d'une graine stockée dans l'état.

### 5. Les valeurs de départ sont des données

L'état d'une vie neuve est `src/game/data/startState.ts` : âge de départ, âge de
la mort, date de départ, capacité de la jauge, loyer, stats… Les règles lisent
ces valeurs dans l'état et n'en codent aucune en dur. Seules les constantes du
calendrier (12 périodes par an) vivent dans le code.

## Conséquences

- Les règles se testent avec de simples objets, sans horloge ni navigateur.
- Un changement de format d'état passe par `version` (voir la sauvegarde).
- On s'interdit les très grands nombres ; si le jeu y vient un jour, un nouvel
  ADR remplacera celui-ci.
