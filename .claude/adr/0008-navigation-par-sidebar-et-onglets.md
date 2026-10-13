# ADR 0008 — Navigation par sidebar et onglets

- **Statut** : accepté
- **Date** : 2026-10-11
- **Issue** : #97 (suivi : #96)

## Contexte

`GamePage` empilait huit fenêtres sur une seule page : il fallait scroller pour
tout voir, et une fenêtre qui change de hauteur fait bouger les suivantes. Le
plan de la ville était une page à part (`/ville`). La v1.5 veut une navigation
stable, où l'URL dit où l'on est, et qui tienne à 480×560 (viewport des e2e).

## Décision

### 1. Sidebar à gauche, onglets en routes imbriquées

L'écran de jeu est un layout : `GamePage` affiche la `Sidebar` et un
`<Outlet />`. Chaque onglet est une page orchestratrice (`src/pages/…`) montée
sur une route enfant de `/jeu`.

| Ordre | Onglet      | Route              | Page           |
| ----- | ----------- | ------------------ | -------------- |
| 1     | Courrier    | `/jeu/courrier`    | `MailPage`     |
| 2     | Vie         | `/jeu/vie`         | `LifePage`     |
| 3     | Compétences | `/jeu/competences` | `SkillsPage`   |
| 4     | Emploi      | `/jeu/emploi`      | `JobsPage`     |
| 5     | Entreprises | `/jeu/entreprises` | `CompaniesPage` |
| 6     | Améliorations | `/jeu/ameliorations` | `UpgradesPage` |
| 7     | Comptes     | `/jeu/comptes`     | `AccountsPage` |
| 8     | Ville       | `/jeu/ville`       | `CityPage`     |

« Recommencer » (lien vers `screenPaths.newLife`) est en bas de la sidebar, à
l'écart des onglets. La liste des onglets (ordre, libellés, slugs) vit dans
`useGameTabs` ; les autres issues s'y réfèrent.

### 2. Redirections

- `/jeu` renvoie à `/jeu/vie` (onglet par défaut), de même qu'un slug inconnu.
- `/ville` renvoie à `/jeu/ville` (anciens liens et favoris).
- `screenPaths.game` reste `/jeu` : `ScreenGuard` et `useGameFlow` sont
  inchangés.
- La sidebar n'existe que sur l'écran de jeu (pas sur le titre, la nouvelle
  vie, l'absence ni la fin).

### 3. `NavLink` plutôt que `Tabs` de Base UI

L'onglet actif vient de l'URL : recharger la page ou revenir en arrière doit
garder l'onglet. `Sidebar` est donc faite de vrais liens `NavLink`
(`aria-current="page"` sur l'onglet actif, clic droit et nouvel onglet qui
fonctionnent), dans un `<nav aria-label="Navigation du jeu">`. Le composant
`Tabs` (Base UI) reste réservé aux sous-onglets d'une page (Entreprises, Améliorations, Comptes),
dont l'état n'a pas à vivre dans l'URL.

### 4. Seuil mobile

Au-dessus de **40 rem** (640 px), la sidebar affiche icônes et libellés. À
40 rem et en dessous (donc à 480 px), elle n'affiche que les icônes, **toujours
à gauche**. Le libellé reste porté par `aria-label` et par une infobulle
(`InfoPanel`). 40 rem est aussi la largeur maximale de la colonne de contenu.
Un media query ne lit pas les variables CSS : la valeur est écrite en dur dans
`Sidebar.module.css` et ici ; la changer demande de mettre les deux à jour.

### 5. Mise en page

La page ne défile plus : la hauteur est celle de l'écran (`100dvh`), seule la
zone de contenu défile et la sidebar reste fixe. Le contenu est une colonne de
`Window` de `40rem` au plus, centrée dans la zone de contenu.

Le courrier non lu se signale par un badge sur l'onglet Courrier (#99). Il n'y
a plus de popup de courrier (#195) : seuls les événements interactifs
interrompent le joueur.

### 6. Badges

`SidebarItem` accepte `badge?` (un nombre ou « 99+ », rendu par le composant
`Badge`, avec `badgeTone?`) et `accessibleLabel?` (nom accessible plus complet).
Le courrier les remplit (#99, `useGameTabs`, ton `alert`).

Les nouveautés (#103) les remplissent pour Compétences, Emploi, Entreprises, Améliorations et
Ville (ton `info`, nom accessible « Emploi, 2 nouveautés »). Un élément est
nouveau quand sa condition est remplie et que l'onglet n'a pas été ouvert
depuis : les ids vus sont dans `GameState.seenItems` (règles dans
`src/game/novelty`), et `useSeenTab` marque l'onglet comme vu à l'ouverture.

### 7. Icônes

Pictogrammes SVG inline 16×16 en aplats (`currentColor`), `aria-hidden`, dans
`SidebarIcon`. Aucune bibliothèque d'icônes.

## Conséquences

- Chaque ancienne fenêtre est atteignable depuis la sidebar ; l'URL reflète
  l'onglet.
- Les e2e ouvrent les onglets avec le helper `openTab(page, slug)` ; les
  sous-onglets (`Tabs`) repartent de leur premier onglet à chaque visite.
- L'état local des hooks de vue (message de retour de l'action, par exemple)
  se réinitialise quand on change d'onglet.
- Le guide de style (§ 1 et § 5) ne décrit plus une seule colonne de fenêtres
  empilées.

## Raccourcis clavier (#105)

`useGameShortcuts`, branché par `GamePage`, écoute le clavier depuis n'importe
quel onglet : `1` à `7` ouvrent les onglets dans l'ordre de la sidebar, `T`
travaille (un clic simple, jamais la bascule de l'automatique) et `E` étudie le
cursus sélectionné. La table vit dans `useKeyboardShortcuts/shortcuts.ts`. Pas
d'Espace ni d'Entrée globaux (ils activent déjà le bouton qui a le focus), et
aucun raccourci d'achat, de vente ni de « Recommencer ». Sont ignorés : un champ
de saisie, un menu ou une confirmation ouverts, Ctrl, Alt, Meta, et une touche
maintenue (`event.repeat`).

Le cursus sélectionné par la flèche d'Étudier vit dans `GamePage`
(`useCourseChoiceState`) et se transmet aux pages par le contexte de l'`Outlet`
(`useCourseChoice`), pour que `E` et le bouton visent le même cursus. Les
raccourcis sont affichés dans l'infobulle des onglets (« Entreprises (5) ») et par
`aria-keyshortcuts`.
