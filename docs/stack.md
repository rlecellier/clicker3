# Stack technique

Stack reprise de [clicker](https://github.com/rlecellier/clicker) (« clicker 1 »).
Les versions ci-dessous sont celles de son `package.json` au 2026-10-11 ; à la création du
projet, on installe les dernières versions compatibles plutôt que de recopier ces
numéros.

## Vue d'ensemble

| Domaine          | Choix                                                                                   | Rôle                                        |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------- |
| Langage          | TypeScript 6 (`strict`)                                                                 | Typage, `noUncheckedIndexedAccess`          |
| UI               | React 19                                                                                | Composants, hooks, context                  |
| Routage          | React Router 8                                                                          | Pages, SPA                                  |
| Build / dev      | Vite 8 + `@vitejs/plugin-react`                                                         | Serveur de dev, bundle                      |
| Composants UI    | `@base-ui/react`                                                                        | Primitives accessibles non stylées          |
| Variantes CSS    | `class-variance-authority`                                                              | Variantes de style typées                   |
| Icônes           | `lucide-react`                                                                          | Icônes SVG                                  |
| Styles           | CSS Modules + `src/global.css`                                                          | Un module par composant, variables globales |
| Tests unitaires  | Vitest 5 + jsdom                                                                        | Règles du jeu, hooks                        |
| Tests de rendu   | Testing Library (`react`, `user-event`, `jest-dom`)                                     | Composants à comportement                   |
| Données de test  | `@faker-js/faker`, `factory-kit`                                                        | Fabriques d'états (`src/test/factories`)    |
| Tests e2e        | Playwright (`e2e/*.e2e.ts`)                                                             | Parcours joueur longs                       |
| Lint             | ESLint 10, `typescript-eslint`, `eslint-plugin-unicorn`, `react-hooks`, `react-refresh` | Qualité et conventions                      |
| Format           | Prettier 3 (`singleQuote`, `trailingComma: all`)                                        | Mise en forme                               |
| CI / déploiement | GitHub Actions, GitHub Pages                                                            | `ci.yml`, `deploy.yml`                      |

Pas de gestionnaire d'état externe (Redux, Zustand…) : l'état du jeu est un
objet JSON géré par un reducer pur, exposé par un context React.

## Architecture

- **`src/game/`** : règles du jeu en TypeScript pur (temps, argent, état,
  sauvegarde…). Aucun import de React ni des couches UI — c'est imposé par
  ESLint (`no-restricted-imports`). Testé en Vitest, sans navigateur.
- **`src/hooks/`** : toute la logique côté React (état, effets, calculs).
- **`src/components/`** : composants visuels, qui affichent des props.
- **`src/contexts/`** : context + provider + hook de consommation.
- **`src/pages/`** : pages routées ; les orchestrateurs branchent hooks et
  composants visuels.
- **`src/test/`** : fabriques et utilitaires de test.
- **`e2e/`** : parcours Playwright.

Le temps de jeu est la seule source de vérité (`elapsedHours`), l'état est
sérialisable (sauvegarde), les changements passent par un reducer pur
(ADR 0002 et suivants de clicker 1).

## Conventions de code

Détail dans [`.claude/adr/0001-project-structure.md`](../.claude/adr/0001-project-structure.md) :

- un dossier par unité (`MoneyCounter/`, `useGame/`, `GameContext/`) avec un
  `index.ts` qui expose l'API publique ;
- nommage React (`PascalCase` / `camelCase`, jamais `kebab-case`) ;
- alias d'import `@page`, `@component`, `@hook`, `@game`, `@context`, `@test`
  (déclarés dans `tsconfig.json` **et** `vite.config.ts`), pas de `../` ;
- pas de `function` déclarée : `const Nom = () => {}` (ESLint `func-style`).

## Outillage

Scripts npm : `dev`, `build` (`tsc -b && vite build`, copie `dist/index.html`
en `dist/404.html` pour le fallback SPA de GitHub Pages), `preview`, `lint`, `format`,
`format:check`, `test`, `test:watch`, `e2e`.

Playwright : viewport mobile (480×560), `webServer` = build + preview sur le
port 4173, Chrome fourni par `CHROMIUM_PATH` en CI.

CI (`ci.yml`, sur PR et `main`) : `lint`, `tsc --noEmit`, `format:check`,
`test`, `build`, puis les parcours e2e. Déploiement (`deploy.yml`) : à chaque
push sur `main` qui touche le site, vers GitHub Pages avec `BASE_PATH`.

## Workflow git

Commits unitaires avec gitmoji, branche linéaire, merge en « rebase and merge »
uniquement, CI verte avant de merger (voir `CLAUDE.md` et les skills `commit`,
`gitmoji`, `merge-request`).

## Ce qui n'est pas repris tel quel

La mécanique de clicker 1 (vie quotidienne : calories, métier, calendrier) est
propre à ce jeu. Seuls la stack, l'architecture en couches et les conventions
sont réutilisés.
