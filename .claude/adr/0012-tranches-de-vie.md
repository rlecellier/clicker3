# ADR 0012 — Tranches de vie : une coquille commune, des onglets par tranche

- **Statut** : accepté
- **Date** : 2026-10-14
- **Issues** : #242, #244

## Contexte

Le jeu couvre 18 ans jusqu'à la mort. On veut le développer tranche de vie par
tranche, en commençant par celles d'avant 18 ans, avant de tout assembler. Les
tranches doivent se ressembler à l'écran (mêmes menus, même style) sans offrir
les mêmes onglets.

## Décision

- **Un seul état, une seule sauvegarde.** `GameState` gagne `lifeSlice` (la
  tranche où la partie a commencé, `youth` par défaut) et `growth` (le compteur
  des tranches d'avant 18 ans). Pas de sous-état par tranche tant qu'on ne sait
  pas comment elles s'enchaînent. La version de l'état passe à 20, sans
  migration (ADR 0010).
- **La situation de naissance est une donnée de l'état** (#254) : `GameState.birthSituation`
  (id de `birthSituations`, `standard` par défaut), choisie à l'écran titre pour la
  petite enfance et conservée pour toute la vie. `restart` l'accepte ; une
  situation inconnue est ignorée. La version passe à 21, sans migration.
- **La petite enfance a son sous-état** (#255) : `GameState.child` (quatre axes de −100 à +100, objets possédés, trimestre, remplissage de la jauge), inerte dans les autres tranches. Son temps est à part (`child.quarter`, 10 gestes par trimestre, 24 trimestres) : elle ne touche ni `period` ni `gauge`, que les événements et l'économie de l'adulte lisent. « Gazouiller » reste l'action `grow` (qui délègue à `babble`) et `doActivity` joue une activité. L'onglet Maison (`house`) s'ouvre au premier objet. Les favoris de l'écran Vie sont une préférence d'interface (`useFavorites`, localStorage, 4 au plus), pas un état du jeu. La version passe à 22, sans migration.
- **Les tranches sont des données** (`lifeSlices`) : id, nom, âges, onglets
  ouverts, et le libellé du bouton et du compteur pour les tranches d'avant 18
  ans. Ajouter une tranche ne demande pas de code propre à cette tranche.
- **Les onglets dépendent de la tranche.** `useGameTabs` filtre la sidebar sur
  `sliceTabs(state)`, et `TabGuard` renvoie à l'onglet Vie quand l'adresse
  d'un onglet fermé est visitée. Les touches 1 à 9 restent liées au rang de
  `gameTabs`.
- **Le départ passe par `restart`.** L'action accepte `lifeSlice` ; une tranche
  d'avant 18 ans démarre sans emploi, sans événement et sans anniversaire
  (`newGame`). L'écran titre porte les boutons qui les lancent ; Jeunesse garde
  le choix du premier emploi.
- **Le mini-jeu est l'action `grow`**, règle pure de `src/game/lifeSlices/`, sans
  effet hors d'une tranche d'avant 18 ans. Le travail et l'étude y sont
  neutralisés côté raccourcis clavier.

- **Les départs en cours de vie sont des données** (`SliceStart`,
  `src/game/data/sliceStarts.ts`) construites par `sliceGame` : l'état de départ
  liste ce qui se possède, tout ce qui en dérive est recalculé par
  `withModifiers`. Le temps reste continu (le compteur de périodes avance, l'âge
  de départ de la vie ne change pas) et les événements uniques déjà déclenchés à
  cet âge sont marqués sans effet ni courrier. Chaque état se vérifie en données
  (éléments existants, conditions remplies) et en simulation (le joueur virtuel
  va jusqu'à la mort).

## Conséquences

- Jeunesse se comporte exactement comme avant.
- Les écrans qui supposent un adulte (en-tête d'argent, courrier, emploi…) ne
  sont pas atteignables avant 18 ans : leurs onglets sont fermés.
- Le jour où les tranches s'enchaînent, on décidera du modèle d'état commun
  (état par tranche ou état partagé) et de ce qui se transmet de l'une à
  l'autre.
