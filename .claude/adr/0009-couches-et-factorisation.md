# ADR 0009 — Couches et règles de factorisation

- **Statut** : accepté
- **Date** : 2026-10-12
- **Issue** : #181 (suivi : #171)

## Contexte

Les ADR 0001 (découpage) et 0003 (état et reducer) disent comment ranger un
fichier, et `CLAUDE.md` sépare visuel et logique. Ils ne disent pas **où
ranger un calcul partagé** ni **quels helpers réutiliser** avant d'en écrire
un. La revue d'architecture #171 a trouvé ce que ce manque produit : la chaîne
de clôture écrite deux fois, deux `switch` miroirs pour appliquer et annuler
une amélioration, un hook d'écran partagé par trois onglets, la ligne d'un
achat construite différemment selon l'écran, des slugs écrits à la main.

## Décision

### 1. Cinq couches, des imports dans un seul sens

```
src/game/  →  src/views/  →  src/hooks/  →  src/pages/
                                  ↑
                         src/components/ (props seulement)
```

| Couche            | Contient                                                        | Peut importer                         |
| ----------------- | --------------------------------------------------------------- | ------------------------------------- |
| `src/game/`       | Règles : état sérialisable, reducer pur, données, formatage     | `@game` seulement                     |
| `src/views/`      | Fonctions pures `état → props` partagées entre écrans           | `@game`, types de `@component`        |
| `src/hooks/`      | Un hook d'écran par onglet, hooks d'interface (geste, minuteur) | `@game`, `@view`, `@context`, `@hook` |
| `src/components/` | Composants visuels : props seulement, pas de test               | `@component`                          |
| `src/pages/`      | Orchestrateurs : branchent un hook d'écran sur des composants   | `@hook`, `@component`, `@page`        |

Les flèches sont imposées par ESLint (`no-restricted-imports`) pour
`src/game/`, `src/views/`, `src/components/` et `src/pages/`. Un composant déclare lui-même
les types qu'il reçoit (`ListItem`, `PressHandlers`…) ; le hook s'y conforme.

### 2. Où ranger un nouveau calcul

- **Un chiffre du jeu** (coût, production, balance, palier) : une fonction de
  `src/game/`, testée. L'écran l'appelle, il ne la recalcule jamais (« une
  formule, un endroit » : ce qui est affiché est ce que le moteur produit).
- **Une mise en forme partagée entre deux écrans** (ligne d'achat, lettre du
  journal) : une fonction de `src/views/`.
- **Ce qui ne sert qu'à un onglet** : son hook d'écran (`useLifeScreen`,
  `useJobsScreen`, `useInvestScreen`…). Un hook d'écran n'en appelle pas un
  autre pour lui prendre une partie : la partie commune va dans `src/views/`.
- **Un morceau de JSX répété** : un composant de `src/components/`.

### 3. Helpers à réutiliser avant d'en écrire un

| Besoin                                     | Helper                                                       |
| ------------------------------------------ | ------------------------------------------------------------ |
| Chercher une donnée par id                 | `findById`, `companyById`, `jobById`, `courseById`…          |
| Condition facultative d'une donnée         | `isRequirementMet(state, requirement)`                       |
| La partie est en cours                     | `isPlaying(state)`                                           |
| Palier et progression (stats, réputation)  | `tierAt`, `tierProgress`                                     |
| Liste des stats                            | `statIds` (`@game/state`)                                    |
| Clôture de période (et balance prévue)     | `settleAccounts` (`@game/period`)                            |
| Ce qui suit une action                     | `afterAction` (sommeil, phase, événements)                   |
| Le temps réel fait avancer la partie       | `isTimeRunning` (`@game/automation`)                         |
| Effet d'une amélioration possédée          | `ownsEffect(state, type, filtre?)`                           |
| Appliquer ou annuler un effet              | `shiftEffect` (`+1` à l'achat, `−1` à l'annulation)          |
| Date d'une période                         | `dateAt`, `formatPeriodDate`                                 |
| Pourquoi un achat est impossible           | `missingConditions`, `unavailableReason` (`@view/purchase`)  |
| Route d'un onglet                          | `tabPath(id)` ; un slug n'est écrit que dans `gameTabs`      |

Un helper qui manque s'ajoute dans le module de sa couche, avec son test, et
dans ce tableau.

## Conséquences

- Ajouter un effet d'amélioration, une étape de clôture ou un onglet se fait en
  un seul endroit ; le compilateur signale un oubli (`switch` exhaustifs,
  table `id → page` des onglets).
- Toute refactorisation de `src/game/` se vérifie à la sortie de `npm run sim`,
  qui doit rester identique.
- Reste ouvert : les multiplicateurs, la capacité de stock, le loyer et les
  salaires sont encore **stockés** et modifiés par opération inverse ; les
  dériver des améliorations possédées est l'objet de #176.
