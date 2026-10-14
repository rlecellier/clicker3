# ADR 0007 — Le sommeil est passif et lié au cerveau

- **Statut** : accepté (amendé par les [ADR 0011](0011-sommeil-quotidien.md) puis [ADR 0013](0013-journee-de-24-heures.md))
- **Date** : 2026-10-11

## Contexte

« Dormir » était une action manuelle (puis automatisable par une amélioration) :
le joueur devait penser à vider ses marqueurs, et l'automatisation du sommeil
n'était qu'une corvée de plus à acheter.

## Décision

- Les marqueurs sont **le cerveau** du personnage (`maxMarkers` en est la
  capacité). Il n'y a plus d'action « Dormir » ni d'amélioration de sommeil
  automatique.
- **Cerveau plein, le personnage s'endort** (`state.isSleeping`, règle
  `fallAsleep`, appliquée par le reducer après chaque action). Acheter et
  vendre restent possibles pendant le sommeil.
- **Travail et étude manuels sont gardés** (`queuedActions`, dans l'ordre, 50 au
  plus) et rejoués au réveil ; un geste devenu impossible est perdu, et un geste
  qui remplit le cerveau rendort (les suivants attendent). Le travail
  **automatique** n'est jamais gardé : il attend la fin du sommeil.
- Le sommeil se joue avec **le temps réel**, comme l'automatisation : un sommeil
  complet dure toujours `automationRules.sleepDurationMs` (une demi-seconde),
  réparti sur les marqueurs (`autoTick`, donc aussi `catchUp`) : un
  marqueur est converti en points de stat (selon le logement) et la jauge de
  temps avance de `actionRules.sleep.gauge / maxMarkers`. Un sommeil complet coûte
  donc toujours `actionRules.sleep.gauge`. Le dernier marqueur réveille.
- Pas d'arrondi par marqueur : les points de stat peuvent être fractionnaires.
- L'interface montre les marqueurs qui diminuent un à un et une barre de sommeil
  sous le cerveau.

## Conséquences

- Sauvegarde en version 2 : `autoSleep` disparaît, `isSleeping` apparaît, et
  l'amélioration `rythme-sommeil` est retirée des sauvegardes (migration 1 → 2).
- Le sommeil n'est plus pénalisé à moitié par l'auto (`yieldFactor` ne concerne
  plus que le travail).
- Le joueur virtuel attend simplement la fin du sommeil.
