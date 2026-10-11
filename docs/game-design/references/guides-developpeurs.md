# Guides de développeurs (sources secondaires)

Guides pratiques trouvés par recherche web. Les chiffres sont des **ordres de
grandeur non vérifiés** à valider en playtest.

- **Blueprint Godot « genre idle clicker »** — https://skills.cat/skills/thedivergentai/gd-agentic-skills/godot-genre-idle-clicker
  - Coût : `prixBase × croissance ^ possédés`, avec 1,15 cité comme croissance
    courante.
  - Prévoir un type grand nombre (mantisse + exposant) dès le départ.
  - Prestige : ne pas le rendre punitif ; les parties suivantes doivent être
    nettement plus rapides (2 à 5×). Déclencheur par seuil de ressource
    (exemple : 1 000 000), en conservant améliorations permanentes et succès.
  - Hors-ligne : calculer les gains au démarrage.
  - Gérer les centaines d'améliorations par des fichiers de données.
- **Tutoriel Construct 3 « clicker idle game »** — https://bugnet.io/blog/how-to-make-a-clicker-idle-game-in-construct-3
  - Gains hors-ligne réduits (50 % dans l'exemple), écran « pendant votre
    absence » au retour, horodatage sauvegardé et durée plafonnée.

_Lecture_ : extraits de résultats de recherche (voir le [README](README.md)).
Ces pages sont moins fiables que la série de Pecorella.

## Utilisé dans

[Game design](../README.md), § 4 (prestige, hors-ligne) et § 5.
