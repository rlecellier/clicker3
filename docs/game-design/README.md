# Game design d'un idle / incremental clicker

Synthèse de recherche (web) pour guider le choix du thème et des mécaniques.
Les chiffres sont des ordres de grandeur à valider en playtest.

## 1. Définition

Un **idle game** (ou _incremental game_) est un jeu où le joueur accumule une
ressource qui, une fois les bonnes améliorations achetées, **continue de croître
sans lui**. Le « clicker » en est l'ancêtre direct : au départ, la croissance
vient des clics ; peu à peu, l'automatisation la remplace.

Le plaisir vient de trois choses : voir les nombres monter, décider où investir,
et sentir que la progression est constante, même absent.

## 2. Boucle centrale

```
Produire  →  Dépenser  →  Produire plus vite  →  (palier / reset)  →  Produire …
```

1. **Produire** une ressource : clic, puis générateurs automatiques.
2. **Dépenser** dans des générateurs (production par seconde) et des
   améliorations (multiplicateurs).
3. **Débloquer** de nouveaux contenus à des paliers.
4. **Réinitialiser** (prestige) contre un bonus permanent quand la progression
   ralentit.

Le jeu se joue en **sessions courtes et fréquentes** : on lance une action, on
laisse tourner, on revient décider.

## 3. Les mathématiques (Kongregate / Anthony Pecorella)

Référence : la série [_The Math of Idle Games_](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i)
([partie II](https://www.gamedeveloper.com/disciplines/the-math-of-idle-games-part-ii),
[partie III](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii)).

- **Coût du prochain générateur** : `coût = coûtBase × croissance ^ nombrePossédé`.
  Le coefficient de croissance se situe souvent entre **1,07 et 1,15** (1,07
  dans AdVenture Capitalist).
- **Production** : `production = productionBase × nombrePossédé × multiplicateurs`.
- **Le moteur du genre** : les coûts croissent **exponentiellement** alors que la
  production croît de façon linéaire ou polynomiale. Au début la production
  rattrape les coûts ; plus tard, ce sont les coûts qui freinent. Les
  **multiplicateurs** (achats uniques, paliers, prestige) ramènent la production
  au niveau des coûts et créent les pics de croissance.
- **Budget → quantité achetable** : il existe une formule fermée (logarithme en
  base `croissance`) pour « acheter max » sans boucle.
- **Grands nombres** : on dépasse vite la précision d'un `number` ; prévoir un
  type grand nombre (mantisse + exposant) ou une bibliothèque dès le départ si
  le jeu vise des exposants élevés, et un affichage en notation courte
  (1,2 M, 3,4e12).

## 4. Piliers de design

### Progression et rythme

- **Paliers fréquents au début** : un achat ou un déblocage toutes les
  quelques secondes dans les premières minutes (accroche), puis des intervalles
  qui s'allongent.
- **Éviter les « zones mortes »** : périodes où rien n'est achetable ni
  débloqué. On les comble avec des paliers de multiplicateurs, des événements
  ou des objectifs visibles.
- **Toujours montrer le prochain objectif** (prochain déblocage, prochain
  palier, temps estimé).

### Automatisation

- Le joueur **automatise ce qui l'ennuie** : acheteurs automatiques, gestionnaires
  (les « managers » d'AdVenture Capitalist). Le clic reste utile mais cesse
  d'être obligatoire.
- Le rôle du joueur glisse de « exécutant » à « stratège ».

### Prestige (reset)

- **Reset contre un bonus permanent** (devise de prestige → multiplicateur).
  Il relance la courbe quand la croissance s'essouffle.
- Il ne doit pas être punitif : la partie suivante doit être sensiblement plus
  rapide (ordre de grandeur : **2 à 5×**) et conserver l'essentiel du méta
  (succès, améliorations permanentes).
- Déclencheur par seuil de ressource, avec un aperçu du gain avant de confirmer.
- Les jeux plus riches empilent des **couches de prestige** (reset de reset).

### Progression hors-ligne

- Calculer les gains à l'ouverture à partir d'un horodatage sauvegardé, avec un
  **plafond de durée** et souvent un **taux réduit** (ex. 50 %).
- Afficher un écran « pendant votre absence ».
- Absente, elle détruit la rétention : à traiter dès la conception de l'état.

### Choix significatifs

- Plusieurs axes d'investissement qui s'opposent (vitesse vs rendement, court vs
  long terme) pour qu'il y ait de la **décision**, pas seulement de l'attente.
- Les améliorations les plus intéressantes **changent les règles** (nouvelle
  ressource, nouveau système) plutôt que d'ajouter « +10 % ».

### Retour sensoriel (juice)

- Chaque clic et chaque achat doivent se **sentir** : animation, son, nombre
  flottant, compteur qui roule.
- Les nombres sont le contenu : leur mise en forme et leur évolution comptent.

### Rétention et méta

- Succès, statistiques, objectifs journaliers ou de session.
- Sauvegarde automatique et export/import de sauvegarde.

## 5. Équilibrage

- **Feuille de calcul / simulateur d'abord** : modéliser les courbes
  (coûts, production, temps entre deux achats) avant de coder l'UI.
- **Données plutôt que code** : générateurs, améliorations et paliers dans des
  fichiers de données, pour ajuster sans toucher à la logique.
- **Sources et puits** : chaque devise doit avoir des sources (production) et
  des puits (achats) équilibrés, sinon elle inflate ou n'a pas de valeur.
- **Mesurer le temps entre achats** : c'est la vraie « difficulté » d'un idle.
- Valider par playtest : les coefficients cités ne sont que des points de départ.

## 6. Pièges courants

- Le jeu qui se joue tout seul sans décision (pas d'intérêt à rester).
- Un mur de progression sans autre issue que d'attendre.
- Un prestige trop tôt (le joueur n'a rien vu) ou trop tard (ennui).
- Un état de jeu non sérialisable : bloque sauvegarde et hors-ligne.
- Des nombres qui débordent ou s'affichent mal.
- Dépendre de `Date.now()` dans la logique : le temps doit venir de l'état
  (cohérent avec clicker 1).

## 7. Exemples de référence

| Jeu                   | Apport notable                                                |
| --------------------- | ------------------------------------------------------------- |
| Cookie Clicker        | Le modèle : clics, bâtiments, améliorations, succès, prestige |
| AdVenture Capitalist  | Managers (automatisation), math de référence (coût × 1,07^n)  |
| Clicker Heroes        | Combat idle, prestige profond                                 |
| Universal Paperclips  | Phases successives qui changent les règles                    |
| Antimatter Dimensions | Couches de prestige, très grands nombres                      |
| Kittens Game          | Gestion de ressources interdépendantes, narration             |

## 8. Questions à trancher pour la suite

À décider à l'étape suivante, avant de coder :

1. **Thème** et ton (univers, direction visuelle).
2. **Ressource principale** et ressources secondaires.
3. **Générateurs et améliorations** : combien, quelle progression de coûts.
4. **Rôle du clic** après l'automatisation.
5. **Prestige** : oui/non, seuil, bonus.
6. **Hors-ligne** : plafond et taux.
7. **Choix de design** qui rendent le jeu plus qu'un compteur (axes
   d'investissement, phases qui changent les règles).
8. Taille de la v1 (jouable en quelques heures, pas des semaines).

## Sources

Résumés détaillés, avec le niveau de lecture de chaque page, dans
[`references/`](references/README.md) :

- [The Math of Idle Games, partie I](references/math-of-idle-games-1.md),
  [II](references/math-of-idle-games-2.md) et
  [III](references/math-of-idle-games-3.md) (Anthony Pecorella,
  [Game Developer](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i)).
- [Réédition GameAnalytics](references/gameanalytics-reedition.md) (formule du
  maximum achetable).
- [Balancing tips : Idle Idol](references/idle-idol-balancing.md).
- [Guides de développeurs](references/guides-developpeurs.md) (prestige 2–5×,
  hors-ligne plafonné) : chiffres indicatifs.
