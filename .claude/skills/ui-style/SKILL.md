---
name: ui-style
description: Use when creating or modifying a visual component or a page of the UI (anything in src/components, src/pages, a CSS Module, or a view hook). Gives the 1999 desktop-software style, the design tokens, the existing components to reuse, and the project's ESLint naming conventions. Takes precedence over the `function` examples of react-dev.
---

# Style de l'UI

Guide complet : `docs/ui/guide-de-style.md`. Page de revue : `/styleguide`
(dev seulement). Ce skill **prime sur `react-dev`** : jamais de `function`
déclarée.

## Principes

Logiciel de gestion de 1999 : fenêtres biseautées, barres de titre bleues,
tableaux, jauge à blocs. Aucun néon, pas de mode sombre. Mobile d'abord
(480×560), colonne de `40rem` max. Le décalage vient du texte, pas des
illustrations. Voix administrative pince-sans-rire.

## Checklist

1. **Réutiliser avant de créer.** Composants existants (`@component/…`) :
   `Title`, `Window`, `Button`, `ProgressBar`, `DataTable`, `Badge`,
   `InfoPanel`, `Tabs`, `Stat` (dans un `<dl>`), `Note`, `CharacterHeader`,
   `MarkerTrack`, `ActionButton`, `SplitActionButton`, `ItemList`, `EventLog`,
   `EventToast`, `LedgerTable`, `CityMap`, `DistrictSheet`, `ImpactGauges`,
   `PageLink`, `FigureList`, `ConfirmPrompt`.
2. **Tokens uniquement**, jamais de valeur en dur (`src/global.css`) :
   couleurs `--color-desktop`, `--color-surface` (`-light`, `-shadow`,
   `-dark`), `--color-paper`, `--color-text` (`-muted`), `--color-primary`
   (`-text`), `--color-note` (`-border`), `--color-alert` (`-text`),
   `--color-focus` ; polices `--font-sans`, `--font-mono` ; `--font-size`,
   `--space` ; biseaux `--bevel-out` (relief) et `--bevel-in` (creux).
3. **CSS Module** `Nom.module.css` à côté du composant, seulement si besoin.
   Variantes avec **cva** (voir `Button`, `Badge`). Widgets interactifs à
   partir de Base UI.
4. **Dossier** `src/components/Nom/` : `Nom.tsx`, `Nom.module.css`,
   `index.ts` (`export { Nom } from './Nom';`).
5. **Nommage ESLint (unicorn)** :
   - `const Nom = () => {}`, jamais `function`.
   - Props : `type NomProperties = {…}` (pas `Props`) ; `ref` devient
     `reference`.
   - Booléens `is/has/can/should…` (`isDisabled`, `isPending`, `isChecked`).
   - Pas de ternaire imbriqué (helper), `toReversed()`/`toSorted()`, pas de
     `undefined` inutile en `return`.
   - Imports par alias (`@component/…`, `@hook/…`, `@game/…`), jamais `../`.
6. **Séparation** : composant visuel (props seulement, pas de test) → hook de
   vue dans `src/hooks/` (`useGameScreen`, `useInvestScreen`,
   `useJournalScreen`) → page orchestratrice (`GamePage`) qui ne fait que
   brancher.
7. **Textes** : formatage via `@game/format` (`formatMoney`, `formatDate`…) ;
   raison de blocage via `describeRequirement` (« Argent insuffisant »,
   « Palier Gestion 2 requis ») ; ne jamais griser sans dire pourquoi.
8. **Accessibilité** : garder le focus visible ; retour dynamique en
   `role="status"` ; décoratif en `aria-hidden` ; tableaux avec `caption`,
   sections avec `aria-label`.
9. **Finir** : `npx prettier --write`, `npx tsc -b`, `npx eslint src`,
   `npm test`. Vérifier à 480×560.
