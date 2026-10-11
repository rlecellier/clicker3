# ADR 0001 — Découpage du projet

- **Statut** : accepté
- **Date** : 2026-10-04

## Contexte

Le projet est une application React + TypeScript. Sans convention, les fichiers
se retrouvent mélangés, les imports relatifs (`../../pages/...`) deviennent
fragiles au moindre déplacement, et il est difficile de savoir où ajouter du
code.

## Décision

### 1. Un dossier par unité de code

Chaque page, composant, hook et context vit dans son propre dossier, nommé comme
l'élément qu'il contient.

- **Composants et pages** : dossier en `PascalCase`.
- **Hooks** : dossier en `camelCase`, préfixé par `use` (`useGame/`).
- **Contexts** : dossier en `PascalCase`, suffixé par `Context` (`GameContext/`).

```
src/
├── components/
│   └── MoneyCounter/
│       ├── index.ts
│       ├── MoneyCounter.tsx
│       ├── MoneyCounter.module.css
│       └── MoneyCounter.test.tsx
├── hooks/
│   └── useGame/
│       ├── index.ts
│       ├── useGame.ts
│       └── useGame.test.ts
├── contexts/
│   └── GameContext/
│       ├── index.ts
│       ├── GameContext.ts
│       ├── GameProvider.tsx
│       ├── useGameContext.ts
│       └── types.ts
└── pages/
    └── GamePage/
        ├── index.ts
        ├── GamePage.tsx
        └── GamePage.module.css
```

### 1 bis. Nommage : conventions React

On suit les conventions standard de React. Pas de `kebab-case`
(`mon-composant`, `use-hook`) dans les noms de fichiers ni de dossiers.

| Élément                  | Convention                   | Exemple                                 |
| ------------------------ | ---------------------------- | --------------------------------------- |
| Composant, page, layout  | `PascalCase`                 | `MonComponent.tsx`, `GamePage.tsx`      |
| Hook                     | `camelCase`, préfixe `use`   | `useGame.ts`                            |
| Context / Provider       | `PascalCase`                 | `GameContext.ts`, `GameProvider.tsx`    |
| Hook de consommation     | `use<Name>Context`           | `useGameContext.ts`                     |
| Types, constantes, utils | `camelCase`                  | `types.ts`, `constants.ts`, `format.ts` |
| CSS Module               | même nom que le composant    | `MonComponent.module.css`               |
| Tests                    | même nom que l'élément testé | `useGame.test.ts`                       |
| Props d'un composant     | `<Component>Props`           | `type MoneyCounterProps = { ... }`      |

Le nom du fichier est identique à celui de l'export principal qu'il contient.

### 2. Contenu d'un dossier

- Le fichier principal porte le nom du dossier (`MoneyCounter/MoneyCounter.tsx`).
- Les tests, types, constantes et helpers propres à l'élément sont placés dans
  le même dossier, à côté de lui.
- Un sous-composant utilisé uniquement par son parent est un dossier imbriqué
  dans le parent. S'il devient partagé, il remonte dans `components/`.

### 3. Context

Un dossier de context contient, à sa racine :

- `<Name>Context.ts` : la création du context (`createContext`) ;
- `<Name>Provider.tsx` : le provider ;
- `use<Name>Context.ts` : le hook de consommation, qui est la seule façon
  d'accéder au context depuis l'extérieur ;
- les autres fichiers utiles au context (types, reducer, constantes, tests).

Le `index.ts` n'exporte que le provider et le hook. L'objet context brut n'est
pas exporté.

### 4. CSS Modules

- Un CSS Module par composant, **uniquement quand le composant a besoin de
  styles propres** : `<Component>.module.css`, dans le dossier du composant.
- Il n'est importé que par le composant qui le possède.
- Les styles globaux (reset, variables, typographie) restent dans un fichier
  global distinct (`src/global.css`).

### 5. Un `index.ts` par dossier

Chaque dossier contient un `index.ts` qui expose son API publique. On importe
le dossier, jamais le fichier qu'il contient.

```ts
// ✅
import { MoneyCounter } from '@component/MoneyCounter';

// ❌
import { MoneyCounter } from '@component/MoneyCounter/MoneyCounter';
```

Les dossiers de regroupement (`components/`, `hooks/`, …) n'ont pas de
`index.ts` barrel : on importe toujours l'unité (`@component/MoneyCounter`),
pas le regroupement.

### 6. Alias d'import

Les imports qui sortent du dossier courant passent par un alias, jamais par un
chemin relatif remontant (`../`).

| Alias          | Dossier            |
| -------------- | ------------------ |
| `@page/*`      | `src/pages/*`      |
| `@component/*` | `src/components/*` |
| `@hook/*`      | `src/hooks/*`      |
| `@game/*`      | `src/game/*`       |
| `@context/*`   | `src/contexts/*`   |
| `@test/*`      | `src/test/*`       |

Seuls les imports vers un fichier du **même dossier** restent relatifs
(`./types`, `./MoneyCounter`).

Les alias sont déclarés à deux endroits, qui doivent rester synchronisés :

- `tsconfig.json` (`compilerOptions.paths`) pour TypeScript ;
- `vite.config.ts` (`resolve.alias`) pour Vite et Vitest.

Tout nouvel alias (par exemple pour un dossier `game/`) s'ajoute aux deux
fichiers et à la table ci-dessus.

### 7. Syntaxe : fonctions fléchées assignées à un `const`

Composants, hooks et helpers s'écrivent `const Nom = () => {}`, jamais
`function Nom() {}`.

```tsx
// ✅
export const MoneyCounter = ({ amount }: MoneyCounterProps) => {
  return <p>${amount}</p>;
};

// ❌
export function MoneyCounter({ amount }: MoneyCounterProps) {
  return <p>${amount}</p>;
}
```

## Conséquences

- Un élément peut être déplacé ou renommé sans casser ses imports internes.
- Le point d'entrée d'un dossier est toujours évident, et les détails internes
  restent privés.
- Les imports sont lisibles et indépendants de la profondeur du fichier.
- Un peu plus de fichiers (`index.ts` partout) et de configuration (alias à
  garder synchronisés).

## Application dans l'outillage

- `eslint.config.js` : `unicorn/filename-case` est configurée pour accepter
  `PascalCase` et `camelCase` (et non plus le `kebab-case` par défaut).
- `unicorn/name-replacements` autorise `props`, `prop` et `ref`, qui sont les
  noms standard de React.
- `no-restricted-imports` interdit `../*` et les imports qui traversent un
  dossier (`./MoneyCounter/MoneyCounter`) : il faut passer par un alias ou par
  le `index.ts` du dossier.
- `func-style: expression` interdit les déclarations `function` : tout passe par
  un `const` fléché.
- Les alias sont déclarés dans `tsconfig.json` et `vite.config.ts`.

## Exceptions

Les fichiers à la racine de `src/` qui ne sont ni des composants ni des hooks
(`main.tsx`, `routes.tsx`, `testSetup.ts`, `global.css`) ne sont pas dans un
dossier dédié. Les constantes et types propres à un hook vivent dans son
dossier (`hooks/useGame/constants.ts`, `types.ts`).
