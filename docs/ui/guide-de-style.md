# Guide de style de l'interface

Référence humaine pour créer ou modifier l'UI. La version courte, destinée aux
agents, est le skill `.claude/skills/ui-style/SKILL.md`. La page `/styleguide`
(développement seulement, voir
[ADR 0006](../../.claude/adr/0006-decisions-visuelles-v1.md)) montre les
composants de base en situation : lancer `npm run dev` puis ouvrir
`/styleguide`.

## 1. Principes

- **Logiciel de gestion de 1999** : fenêtres à bords biseautés, barres de titre
  bleues, tableaux, jauge à blocs. Aucun néon.
- **Le décalage vient du texte**, pas des illustrations
  (`docs/game/ton-et-univers.md`, § Identité visuelle).
- **Mobile d'abord** : le viewport des tests e2e est 480×560. Sur bureau, le
  contenu reste une colonne centrée (`max-width: 40rem`), à droite d'une
  sidebar de navigation (ADR 0008).
- **Pas de mode sombre en v1** (`color-scheme: light`).
- Focus toujours visible (contour pointillé `--color-focus`) et
  `prefers-reduced-motion` respecté, tous deux posés dans `src/global.css`.

## 2. Tokens

Définis dans `:root` de `src/global.css`. On n'écrit jamais de valeur de
couleur, de police ou d'espacement en dur dans un CSS Module : on utilise un
token.

| Token                    | Usage                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `--color-desktop`        | Fond du `body` (le « bureau »)                               |
| `--color-surface`        | Fond des fenêtres, boutons, onglets                          |
| `--color-surface-light`  | Arête claire des biseaux                                     |
| `--color-surface-shadow` | Ombre moyenne des biseaux                                    |
| `--color-surface-dark`   | Arête sombre des biseaux, ombre portée des fenêtres          |
| `--color-paper`          | Fond des zones de contenu (tableaux, jauges), arête blanche  |
| `--color-text`           | Texte courant                                                |
| `--color-text-muted`     | Texte secondaire (détails, raisons de blocage)               |
| `--color-primary`        | Bleu institutionnel : barre de titre, jauge, bouton primaire |
| `--color-primary-text`   | Texte sur fond `--color-primary`                             |
| `--color-note`           | Jaune post-it (`Note`)                                       |
| `--color-note-border`    | Bordure du post-it                                           |
| `--color-alert`          | Rouge sobre : alertes, bouton `danger`                       |
| `--color-ok`             | Vert sobre : prérequis obtenu (texte sur `--color-paper`)    |
| `--color-alert-text`     | Texte sur fond `--color-alert`                               |
| `--color-focus`          | Contour de focus (`:focus-visible`)                          |
| `--font-sans`            | Tahoma, Verdana, puis polices de repli : tout le texte       |
| `--font-mono`            | Courier : texte à chasse fixe                                |
| `--font-size`            | Taille de base (0,875 rem)                                   |
| `--space`                | Unité d'espacement (0,5 rem) ; multiples ou fractions        |
| `--bevel-out`            | Biseau en relief (fenêtre, bouton, onglet)                   |
| `--bevel-in`             | Biseau en creux (tableau, jauge)                             |

Les biseaux s'appliquent avec `box-shadow: var(--bevel-out)` (ou `--bevel-in`).

## 3. Composants

Tous dans `src/components/`, importés par `@component/Nom`. Un composant est
visuel : il affiche ses props, sans état métier, et n'a pas de test (voir
`CLAUDE.md`). Les variantes sont décrites avec `cva`. Les captures se prennent
sur `/styleguide` (pas de capture versionnée : la page fait foi).

### Fondations

| Composant     | Rôle et props clés                                                                                                                                  | Quand l'utiliser                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `Title`       | `children` ; rend un `h1`                                                                                                                           | Titre de page                                  |
| `Window`      | `title`, `children`, `actions?` (zone à droite de la barre de titre) ; section nommée par `title`                                                   | Tout bloc de contenu d'une page                |
| `Button`      | `variant` (`default`, `primary`, `danger`), `size` (`normal`, `large`), `isDisabled`, `isPending`, `onClick`, `type` ; base `@base-ui/react/button` | Action simple sans détail ni raison de blocage |
| `ProgressBar` | `label`, `value`, `max` ; Base UI Progress                                                                                                          | Jauge (temps, compétence)                      |
| `DataTable`   | `caption`, `columns` (`id`, `header`, `isNumeric?`), `rows` (`id`, `cells`)                                                                         | Données tabulaires                             |
| `Badge`       | `tone` (`neutral`, `info`, `alert`), `children`                                                                                                     | Étiquette courte (palier, état)                |
| `InfoPanel`   | `content`, `children` (un seul élément déclencheur) ; Base UI Tooltip                                                                               | Aide au survol ou au focus                     |
| `Tabs`        | `tabs` (`id`, `label`, `content`), `defaultTab?`, `value?` + `onValueChange?` (mode contrôlé) ; Base UI Tabs                                                                                    | Regrouper des panneaux                         |
| `Sidebar`     | `label`, `items` (`id`, `label`, `icon`, `to`, `badge?`, `badgeTone?`), `footer?` (un item, à l'écart) ; `NavLink`, icônes `SidebarIcon`      | Navigation de l'écran de jeu (ADR 0008)        |
| `GameHeader`  | `money` (texte formaté), `date` (texte formaté), `gauge` (`value`, `max`) ; réutilise `Stat` et `ProgressBar`, hauteur fixe sur une ligne | En-tête fixe de l'écran de jeu (argent, date) |
| `Stat`        | `label`, `value` ; à placer dans un `<dl>`                                                                                                          | Couple libellé / valeur                        |
| `Note`        | `children`, `minLines?` (hauteur réservée), `to?` (le post-it devient un lien) ; post-it jaune                                                                                          | Message d'ambiance ou rappel                   |

### Page de jeu

| Composant         | Rôle et props clés                                                                                                             | Quand l'utiliser                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `CharacterHeader` | `name`, `age`, `date`, `phase` (textes déjà formatés)                                                                          | En-tête du personnage                                      |
| `MarkerTrack`     | `count`, `max`, `isSleeping` ; blocs décoratifs (`aria-hidden`)                                                                              | Jetons ou marqueurs limités                                |
| `ActionButton`    | `label`, `detail?`, `reason?`, `isDisabled?`, `variant?`, `isAuto?`, `autoHint?`, `press?`, `onClick`                          | Action de jeu ; l'appui long (`press`) active l'automatique |
| `SplitActionButton` | `label`, `detail?`, `reason?`, `isDisabled?`, `menuLabel`, `choices` (`id`, `label`, `detail?`), `selectedId`, `onSelect`, `onClick` ; flèche = Base UI Menu | Action de jeu dont la cible se choisit (cursus à étudier) |
| `ItemList`        | `caption`, `items` de type `ListItem` : `id`, `title`, `detail?`, `badge?`, `actionLabel`, `isDisabled`, `reason?`, `conditions?` (`label`, `isMet`), `onAction` ; prop `highlightedId?`, id HTML `item-<id>` | Liste d'éléments achetables ou activables                  |
| `EventLog`        | `entries` (`id`, `date`, `text`, `isNew`), `emptyText` ; liste nommée « Courrier »                                             | Historique des événements                                  |
| `MailPopup`       | `date`, `text`, `otherCount`, `mailPath`, `onDismiss`, `onPause`, `onResume` ; `role="status"`, non modale ; placement hors flux par l'appelant (`GamePage`) | Nouveau message signalé sans changer d'onglet               |
| `LedgerTable`     | `caption`, `rows` (`id`, `label`, `last`, `total`)                                                                             | Relevé de comptes (dernier montant et cumul)               |

### Carte, indicateurs et écrans de début et de fin

| Composant        | Props clés                                                                                                                                  | Usage                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `CityMap`        | `title`, `slogan`, `districts` (`MapDistrict` : `id`, `name`, `isLocked`, `isSelected`, `conditions`, `buildings`), `onSelect` ; SVG, clavier | Plan d'urbanisme : quartiers en aplats, bâtiments par entreprise    |
| `DistrictSheet`  | `name`, `description`, `detail`, `badge?`, `actionLabel`, `isDisabled`, `reason?`, `onAction`, `gauges`                                       | Fiche du quartier choisi : coût, déblocage, jauges si ouvert        |
| `ImpactGauges`   | `caption`, `gauges` (`id`, `label`, `value` de 0 à 100) ; réutilise `ProgressBar`                                                              | Indicateurs d'impact (pollution, inégalités), en lecture seule      |
| `PageLink`       | `to`, `children` ; lien d'allure bouton                                                                                                        | Navigation entre écrans (`/`, `/nouvelle-vie`)                           |
| `FigureList`     | `figures` (`label`, `value`) ; grille de `Stat`                                                                                                | Chiffres d'un bilan (absence, fin de vie)                           |
| `ConfirmPrompt`  | `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`                                                                              | Confirmation en ligne avant un geste qui détruit la partie          |

### Règle de réutilisation

Avant de créer un composant, vérifier la liste ci-dessus. Un nouveau composant
se justifie s'il sera utilisé ailleurs ou s'il porte un rôle d'interface
distinct ; sinon, composer les existants.

## 4. Accessibilité

- **Rôles et noms** : `Window` et `ItemList` sont des `section` nommées
  (`aria-label`) ; `EventLog` est une liste nommée ; les tableaux ont une
  légende (`caption`). Les widgets Base UI (`Tabs`, `Menu`, `Progress`,
  `Tooltip`) fournissent leurs rôles ARIA et la navigation au clavier.
- **Clavier** : tout est atteignable et activable au clavier ; ne jamais
  retirer l'outline de focus.
- **Retour d'action** : le message de retour de `LifePage` et `MailPopup`
  portent `role="status"` (région vive polie). Tout nouveau retour dynamique
  fait de même.
- **Décoratif** : un élément purement visuel (blocs de `MarkerTrack`, points de
  suspension de `Button` en attente) est `aria-hidden`. Un bouton en attente
  porte `aria-busy`.
- **Blocage explicite** : ne jamais griser sans dire pourquoi ; la raison est
  affichée en texte (voir § 6), pas seulement par la couleur.
- **Contrastes** : on reste sur les paires du système : `--color-text` sur
  `--color-surface` ou `--color-paper`, `--color-primary-text` sur
  `--color-primary`, `--color-alert-text` sur `--color-alert`. Toute autre
  paire se vérifie.

## 5. Mise en page

- L'écran de jeu est une **sidebar fixe à gauche** (composant `Sidebar`) et
  une zone de contenu qui défile seule (ADR 0008). Au-dessus de `40rem`, la
  sidebar montre icônes et libellés ; à `40rem` et en dessous (480 px compris),
  des icônes seules, toujours à gauche, avec le libellé en `aria-label` et en
  infobulle. Un seul onglet est affiché à la fois (`/jeu/<onglet>`).
- Dans la zone de contenu : une colonne de fenêtres `Window` ; largeur
  maximale `40rem`, centrée.
- Les écrans hors jeu (titre, nouvelle vie, absence, fin) n'ont pas de
  sidebar : une colonne centrée de `40rem` au plus.
- Pas de largeur fixe en pixels : contenu fluide, `min-width: 0` sur les
  éléments de flex qui contiennent du texte long.
- Espacements en multiples de `--space`.
- **Zones tactiles** : toute cible interactive (lien de la sidebar, `Button`,
  `PageLink`, onglet, ligne d'`ItemList`, choix d'un menu, bouton de fermeture
  de la popup) fait au moins **44×44 px**, soit `--touch-target` (`2.75rem`,
  pour 16 px par rem). On l'applique en `min-height` (et `min-width` pour les
  icônes seules) : le contenu peut être plus grand, jamais plus petit.
- L'infobulle (`InfoPanel`) ne capte pas les clics (`pointer-events: none`) : au
  toucher, elle s'affiche sans gêner le tap suivant. Le nom accessible vient de
  `aria-label`, pas de l'infobulle.
- Les badges de la sidebar en icônes seules sont posés sur l'angle du lien,
  dans la barre : ils ne la font pas déborder.
- Vérifier à 480×560 (viewport des tests e2e) et à 360×640 (petit Android,
  projet Playwright `petit-mobile`, qui rejoue `life.e2e.ts`) avant de livrer :
  aucun défilement horizontal, `openTab` le vérifie à chaque onglet.

## 6. Ton des textes

Voix administrative pince-sans-rire (`docs/game/ton-et-univers.md`) : phrases
courtes, vocabulaire de formulaire, jamais d'exclamation ni de blague
explicite.

- Libellés d'actions : verbe à l'infinitif (« Travailler », « Vendre le
  surplus »).
- Raisons de blocage lisibles, générées par `describeRequirement`
  (`@game/format`) : « Argent insuffisant », « Palier Gestion 2 requis ».
- Nombres, dates et âges formatés par `@game/format` (`formatMoney`,
  `formatCount`, `formatDecimal`, `formatDate`, `formatAge`, `formatPhase`),
  jamais à la main.

## 7. Conventions de code UI

Les règles ESLint (`unicorn` strict) imposent :

- Pas de `function` déclarée : `const Nom = () => {}`.
- Types de props nommés `NomProperties` (pas `NomProps`) ; `ref` s'écrit
  `reference`.
- Booléens préfixés `is`, `has`, `can`, `should` (`isDisabled`, `isPending`,
  `isChecked`).
- Pas de ternaire imbriqué (extraire un helper) ; `toReversed()` et
  `toSorted()` plutôt que `reverse()` et `sort()` ; pas de `undefined` inutile
  dans un `return`.
- Imports par alias (`@component/…`, `@hook/…`, `@game/…`), jamais de `../`.
- Un dossier par composant : `Nom.tsx`, `Nom.module.css` (si besoin de
  styles), `index.ts` (ADR 0001).

### Séparation visuel / hook / page

1. **Composant visuel** (`src/components/`) : props seulement.
2. **Hook de vue** (`src/hooks/`, ex. `useGameScreen`, `useInvestScreen`,
   `useJournalScreen`) : état, calculs, appels au context ; renvoie des
   données prêtes à afficher (textes déjà formatés).
3. **Page orchestratrice** (`src/pages/`, ex. `LifePage`) : branche les hooks
   sur les composants et ne fait rien d'autre.

## 8. Ajouter un composant

1. Vérifier qu'aucun composant existant ne convient (§ 3).
2. Créer `src/components/Nom/` avec `Nom.tsx`, `Nom.module.css`, `index.ts`.
3. Styler avec des tokens uniquement ; variantes avec `cva`.
4. Partir d'un composant Base UI pour les widgets interactifs (bouton, onglets,
   menu…).
5. Ne pas écrire de test pour un composant uniquement visuel.
6. L'ajouter à `/styleguide` seulement s'il illustre la doc ; mettre à jour ce
   guide et le skill.
