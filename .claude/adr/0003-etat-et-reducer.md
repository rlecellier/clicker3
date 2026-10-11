# ADR 0003 — Forme de l'état et du reducer

- **Statut** : accepté
- **Date** : 2026-10-11

## Contexte

Toute la logique du jeu doit passer par un point d'entrée unique, pur et
extensible, que la couche React branche telle quelle (`useReducer`) et que les
tests, le simulateur et le rattrapage d'absence rejouent.

## Décision

### 1. Un seul reducer pur

```ts
reduce(state: GameState, action: GameAction): GameState
```

- Aucune mutation : on retourne un nouvel objet (ou le même état s'il ne change
  pas). Les tests passent un état gelé en profondeur (`@test/deepFreeze`).
- Aucun effet de bord, aucune lecture d'horloge ni d'aléatoire global.

### 2. Actions : union discriminée

`GameAction` est une union discriminée sur `type`. Chaque issue ajoute ses
variantes dans `src/game/reducer/actions.ts` et son `case` dans `reduce`. Le
`switch` est exhaustif (le compilateur signale une variante oubliée).

### 3. Organisation de `src/game/`

Un dossier par unité, comme le reste du projet (ADR 0001). Les premiers
modules :

| Dossier    | Rôle                                                   |
| ---------- | ------------------------------------------------------ |
| `state/`   | Types de l'état (`GameState`)                          |
| `data/`    | Données : état de départ et contenu (emplois, etc.)    |
| `time/`    | Âge et date dérivés de la période                      |
| `period/`  | Jauge de temps et résolution d'une période             |
| `reducer/` | `GameAction` et `reduce`                               |

Chaque règle ajoutée depuis a son propre dossier (`economy/`, `sleep/`,
`automation/`…) ; `ls src/game` donne la liste à jour.

Les modules s'importent par alias (`@game/state`, `@game/time`…). `src/game/`
n'importe ni React ni les couches UI (imposé par ESLint).

### 4. Résolution d'une période

`addGauge(state, amount)` remplit la jauge. Tant qu'elle atteint sa capacité et
que le personnage est vivant, `endPeriod` s'exécute, dans l'ordre de
`docs/game/v1.md` § 1 :

1. `produceGoods` — production ;
2. `sellGoods` — ventes, puis rangement de l'invendu dans l'entrepôt ;
3. `chargeExpenses` puis `chargeInterest` — loyer et salaires, puis intérêt
   d'un solde négatif ; `closePeriod` clôt ensuite le relevé (`ledger`) ;
4. `ageCharacter` — vieillissement, passage à `dead` à l'âge de mort ;
5. `resetGauge` — la jauge repart.

Les événements (`triggerEvents`) sont évalués après l'étape 5 : ils sont datés
de la période qui commence.

À l'origine, les étapes 1 à 3 étaient des fonctions identité (points
d'extension) ; les issues suivantes les ont remplies sans changer l'ordre.

**Surplus de jauge** : l'étape 5 retire une capacité de jauge et **conserve le
surplus** au lieu de remettre à zéro. Sans cela, une action longue ne ferait
passer qu'une période et le surplus serait perdu ; avec cela, plusieurs périodes
peuvent passer d'un coup (rattrapage d'absence).

## Conséquences

- Le simulateur et le rattrapage d'absence sont de simples boucles sur `reduce`.
- Ajouter une règle = une variante d'action, ou le remplissage d'une étape.
- Un état mort est terminal : `addGauge` ne change plus rien.
