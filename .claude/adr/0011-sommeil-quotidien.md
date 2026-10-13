# ADR 0011 — Le sommeil est quotidien, à heure fixe et configurable

- **Statut** : accepté (amende l'[ADR 0007](0007-sommeil-passif.md))
- **Date** : 2026-10-13

## Contexte

Le sommeil se déclenchait cerveau plein et coûtait toujours 40 de jauge sur 70 :
le personnage pouvait dormir presque toute une journée, ce qui n'est pas crédible.
On veut un compromis : dormir moins laisse du temps éveillé mais convertit moins
de marqueurs en compétences ; dormir plus l'inverse (issue #202).

## Décision

- Le joueur choisit une durée `sleepHours` de 4 à 9 h (8 h au départ), dans le
  profil (action `setSleepHours`). Le choix ne sert qu'à partir de la période
  suivante : `periodSleepHours`, copiée de `sleepHours` à chaque passage de
  période, fixe le coucher et le coût de la période en cours.
- Une période est une journée de 24 h qui commence au réveil de 7 h. Chaque durée
  a un horaire de coucher et de réveil (`actionRules.sleep.schedule` : 8 h =
  23 h → 7 h, 6 h = 1 h → 7 h, 4 h = 2 h → 6 h…).
- **Le personnage s'endort une fois par période**, quand la jauge atteint
  l'heure du coucher (`bedtimeGauge`). Le cerveau plein ne déclenche plus rien ;
  ses marqueurs en trop restent perdus. `lastSleepPeriod` interdit un second
  sommeil dans la même période. Si une action a traversé le coucher et la fin de
  période d'un coup, le sommeil manqué se rattrape dès le début de la période
  suivante.
- Le sommeil coûte `durée × gaugeCapacity / 24` de jauge et se joue en autant de
  pas que de marqueurs que la durée permet de vider (table `schedule` : 9 h = 5,
  tout le cerveau de départ, puis un de moins par heure, 4 h = 0 ; un pas au
  moins, car dormir prend du temps). Le cerveau retient plus que ce qu'une
  journée produit : ce qui n'est pas vidé reste pour le sommeil suivant, et
  dormir moins fait gagner de l'argent mais apprendre moins. Chaque pas vide le plus ancien marqueur s'il y en a un, coûte
  `sleepStepGauge` de jauge (figé à l'endormissement) et le sommeil dure
  toujours 500 ms au total. La table est le point d'extension de futures
  améliorations.
- État : `sleepHours`, `periodSleepHours`, `sleepLeft`, `sleepTotal`,
  `sleepStepGauge`, `sleepConvertible`, `lastSleepPeriod`.

## Conséquences

- Les stats ne progressent plus qu'au rythme d'un sommeil par période : la
  progression et l'équilibrage du simulateur sont à recaler (issue de suivi).
- Sauvegarde : pas de migration (ADR 0010).
