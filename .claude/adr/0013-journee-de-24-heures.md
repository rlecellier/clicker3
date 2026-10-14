# ADR 0013 — La journée fait 24 h, le sommeil ne change que par les améliorations

- **Statut** : accepté (amende l'[ADR 0007](0007-sommeil-passif.md) et l'[ADR 0011](0011-sommeil-quotidien.md))
- **Date** : 2026-10-14
- **Issue** : #261

## Contexte

Le joueur choisissait une durée de sommeil (4, 6 ou 8 h, ADR 0011) sans en voir
l'effet, et une barre de sommeil se remplissait sans qu'on sache ce qui se
passait. Le sommeil coûtait de la jauge comme une action, avec un coucher à
heure fixe, une pause où les gestes étaient gardés puis rejoués, et un état de
neuf champs.

## Décision

- **Une période est une journée de 24 h** (elle simule un mois : le joueur ne
  voit que la date, jamais d'horloge). Le sommeil n'y est plus un choix : il
  vaut `base + h « dormir plus » − h « dormir moins »`, borné à 4–12 h.
- **La base dépend de la tranche de vie** (`sleepBaseHours` dans
  `src/game/data/lifeSlices.ts`) et se lit d'après l'âge, donc elle change en
  cours de partie : 12 h (petite enfance), 10 h, 9 h, 8 h (jeunesse), 7 h (âge
  adulte), 7 h (maturité), 6 h (vieillesse).
- **La jauge est le temps d'éveil, en minutes entières** : capacité =
  `(24 − sommeil) × 60`. Elle est dérivée (`withModifiers` et changement de
  période). Chaque action déclare sa durée `minutes` (nombre libre, aucun palier) :
  une heure de sommeil en moins ajoute 60 minutes d'éveil, donc des actions en
  plus quelle que soit leur durée. Les durées d'une action pourront aussi être
  réduites minute par minute par des boosts.
- **Le sommeil se résout à la clôture de la période**, sans pause : tous les
  marqueurs sont convertis en points de stat d'un coup. Plus de `isSleeping`, de
  `queuedActions`, de coucher, de durée de 500 ms ni de barre. Le nombre de
  marqueurs convertis est gardé (`lastNightMarkers`) pour le bilan de nuit.
- **Rendement d'apprentissage** : `(base + h « dormir plus ») / base`, en plus du
  logement et des coups de pouce. « Dormir moins » n'y touche pas.
- **Deux familles d'améliorations** : « Dormir mieux » (+1 h de sommeil, plus
  d'apprentissage) et « Optimiser son sommeil » (−1 h, apprentissage inchangé),
  via les effets `sleepMore` et `sleepLess`.
- **Heures supplémentaires** : les seuils passent en minutes de travail
  (`regularMinutes`), la majoration est conservée.

## Conséquences

- Le nombre d'actions par période est `éveil / durée` : il se déduit du sommeil.
- Les durées de départ (travail 200 min, étude 300 min) gardent à peu près le
  nombre d'actions par période d'avant ; l'équilibrage fin est une issue de suivi.
- Sauvegarde : pas de migration (ADR 0010), la version monte d’un cran.
