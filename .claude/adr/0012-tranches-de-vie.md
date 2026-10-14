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
- **Événements, fouille et demandes de la petite enfance** (#256) : `child` porte aussi une graine (`seed`), les événements vécus, l'événement en attente, les traits, la fouille de chaque lieu, l'Attention et les souhaits promis. Les événements ne sont **pas** ceux de la v1 (`src/game/events`, pensés pour des dates et des effets d'adulte) : la petite enfance a son pool à conditions (`childEvents` : âge, axe, trait, événement vécu, objet, contexte) et son tirage pondéré, dans `src/game/earlyChildhood`. Le hasard vient de la graine de l'état (`nextRandom`), fournie par l'appelant au `restart` ; jamais de `Math.random()` dans les règles. Un événement ouvert arrête le jeu (`pendingEvent`) jusqu'à `chooseEvent`. Avant 18 ans, le reducer n'appelle plus `afterAction` (sommeil, événements du monde, anniversaires) : jusque-là, un enfant déclenchait l'« euro » de 1999. La version passe à 23, sans migration.
- **Relations** (#257) : `GameState.relations` (personnes : id, nom, rôle, `family` ou `friend`, lien de 0 à 100), pour toute tranche, construit au départ depuis les parents de la situation de naissance (`initialRelations`). Règles dans `src/game/relations`. Le lien de départ vaut 30 % de l'affection du parent ; jouer avec quelqu'un le renforce, des effets d'événement (`bond`) le font bouger. Trois paliers : 25 ouvre « Jouer avec… » (activité tirée des goûts de la personne, `Parent.passion`), 50 pousse en douce son axe à chaque trimestre, 75 divise par deux les pertes de lien. L'événement obligatoire du premier copain (3 ans) crée l'ami. Les événements lisent le lien (condition `bond`). L'onglet Relations (sous-menu Famille, puis Amis) est ouvert dès la petite enfance. La version passe à 24, sans migration.
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
