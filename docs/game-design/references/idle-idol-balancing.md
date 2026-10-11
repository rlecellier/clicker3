# Balancing tips : comment nous avons géré les maths d'Idle Idol

- **URL** : https://www.gamedeveloper.com/design/balancing-tips-how-we-managed-math-on-idle-idol
- **Lecture** : extraits via recherche web, la liste complète des conseils n'a
  pas été vue (voir le [README](README.md))

## Contenu

Retour d'expérience sur le premier idle game de l'équipe, qui a rencontré des
difficultés d'équilibrage et en tire des conseils applicables à tout jeu.

## Points retenus

- **Problème** : rythme trop lent, puis trop rapide après de petites
  modifications ; l'équilibrage se complique à mesure qu'on ajoute compétences
  actives et passives, systèmes spéciaux et sources d'argent. Questions posées :
  comment éviter que le jeu casse, équilibrer les compétences passives entre
  elles, et rendre la progression agréable.
- **Coût contre gain** : un idle associe un coût d'amélioration exponentiel à un
  gain à peu près linéaire. Dans le graphique de l'auteur, le coût dépasse le
  gain vers le niveau 35.
- **Taux de croissance** : coût et gain avec une base exponentielle de 1,1, le
  gain croissant plus lentement pour que le rythme ne s'emballe pas. Les courbes
  exponentielles s'emballent très vite : même 0,01 d'écart compte.

## À faire

Les autres conseils de l'article n'ont pas été vus : à compléter avant la phase
d'équilibrage.

## Utilisé dans

[Game design](../README.md), § 5 « Équilibrage ».
