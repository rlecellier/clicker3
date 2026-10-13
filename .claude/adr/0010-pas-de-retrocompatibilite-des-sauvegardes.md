# ADR 0010 — Pas de rétrocompatibilité des sauvegardes tant qu'aucune version n'est « populaire »

- **Statut** : accepté
- **Date** : 2026-10-13

## Contexte

Chaque version du jeu change l'état (nouvelles améliorations, nouveaux champs,
équilibrage). Garder les anciennes sauvegardes jouables demande une migration
par changement de version, et un test par migration. Or les versions
intermédiaires (v1.5, v1.6, …) sont temporaires : elles seront remplacées et
personne n'a besoin d'y reprendre une partie.

## Décision

- **Une version qui change l'état n'a pas à migrer les sauvegardes
  précédentes.** On n'écrit pas de migration, de fixture de sauvegarde ancienne
  ni de test de chargement d'une ancienne version pour la seule continuité.
- Une sauvegarde d'une version inconnue ou illisible est refusée sans planter
  (`unknown-version`, `invalid-format`) : le joueur repart d'une nouvelle partie.
- Les critères de fin d'une version ne contiennent donc jamais « une sauvegarde
  de la version précédente se charge sans perte ».
- Les migrations déjà écrites ne sont pas à enrichir. Elles peuvent être
  supprimées quand elles gênent.

## Quand changer

Le jour où une version est jugée **populaire** (des joueurs y ont des parties
qu'on ne veut pas perdre), on décide explicitement de garantir la rétrocompatibilité
à partir d'elle : cet ADR est alors remplacé, avec la liste des versions
concernées et la politique de test.
