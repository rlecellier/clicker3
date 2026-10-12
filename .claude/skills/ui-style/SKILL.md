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
(480×560) : `GameHeader` fixe en haut, `Sidebar` à gauche (icônes seules sous
`40rem`, ADR 0008), zone de contenu qui défile seule, en colonne de `40rem`
max. Les écrans hors jeu n'ont pas de sidebar. Le décalage vient du texte, pas des
illustrations. Voix administrative pince-sans-rire.

## Checklist

1. **Réutiliser avant de créer.** Composants existants (`@component/…`) :
   `Title`, `Window`, `Button`, `ProgressBar` (`size="small"` sous un bouton),
   `DataTable`, `Badge`, `InfoPanel`, `Tabs` (contrôlé avec `value` +
   `onValueChange`), `Sidebar` (items `badge`, `badgeTone`, `accessibleLabel`,
   `shortcut`), `GameHeader`, `Stat` (dans un `<dl>`), `Note` (`minLines`,
   `to`), `CharacterHeader`, `MarkerTrack`, `ActionButton` et
   `SplitActionButton` (`press` : appui maintenu, `shortcut`), `ItemList`
   (`effects`, `highlightedId`), `EventLog`, `MailPopup` (popup non modale),
   `LedgerTable`, `LedgerSection`, `CityMap`, `DistrictSheet`, `ImpactGauges`,
   `PageLink`, `FigureList`, `ConfirmPrompt`, `ScreenPage` (écran hors jeu),
   `WithBadge` (titre + badge), `Balance` (variation signée), `ActionInfo`
   (détail ou raison sous un bouton).
   Toute action de bouton se joue au toucher : un tap = une action (voir la
   politique de test dans `CLAUDE.md`), vérifié par `tap()` dans un parcours e2e.
2. **Tokens uniquement**, jamais de valeur en dur (`src/global.css`) :
   couleurs `--color-desktop`, `--color-surface` (`-light`, `-shadow`,
   `-dark`), `--color-paper`, `--color-text` (`-muted`), `--color-primary`
   (`-text`), `--color-note` (`-border`), `--color-alert` (`-text`),
   `--color-ok`, `--color-focus` ; polices `--font-sans`, `--font-mono` ; `--font-size`,
   `--space`, `--touch-target` ; biseaux `--bevel-out` (relief) et `--bevel-in` (creux).
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
   - Un composant n'importe ni `@game`, ni `@hook`, ni `@context`, ni `@view`
     (imposé par ESLint) : ses types d'entrée sont déclarés chez lui.
6. **Séparation** : composant visuel (props seulement, pas de test) → hook de
   vue dans `src/hooks/` (`useLifeScreen`, `useInvestScreen`,
   `useAccountsScreen`) → page orchestratrice (`LifePage`…) qui ne fait que
   brancher.
7. **Textes** : formatage via `@game/format` (`formatMoney`, `formatDate`…) ;
   raison de blocage via `describeRequirement` (« Argent insuffisant »,
   « Palier Gestion 2 requis ») ; ne jamais griser sans dire pourquoi.
   Toute valeur que des modificateurs changent s'affiche dans sa version
   finale (`@game/economy`), jamais en valeur de base.
8. **Hauteurs stables** : tout texte dynamique a une hauteur réservée
   (`min-height` en `lh`, ellipse sur une ligne, deux lignes tronquées pour
   un détail), et ce qui apparaît en cours de partie occupe déjà sa place :
   les boutons ne bougent jamais sous le doigt. Une popup se superpose
   (`MailPopup`), elle ne pousse pas le contenu.
9. **Zones tactiles** : toute cible interactive fait au moins
   `var(--touch-target)` (44 px) en `min-height` (et `min-width` pour une
   icône seule).
10. **Accessibilité** : garder le focus visible ; retour dynamique en
    `role="status"` ; décoratif en `aria-hidden` ; tableaux avec `caption`,
    sections avec `aria-label`. Navigation en `<nav>` avec `aria-current` ;
    badge de sidebar accompagné d'`accessibleLabel` ; touche de raccourci
    déclarée par `shortcut` (`aria-keyshortcuts`).
11. **Finir** : `npx prettier --write`, `npx tsc -b`, `npx eslint src`,
   `npm test`. Vérifier à 480×560 et 360×640 (aucun défilement horizontal).
    Tout nouveau composant partagé va dans `/styleguide` et dans le tableau
    du guide.
