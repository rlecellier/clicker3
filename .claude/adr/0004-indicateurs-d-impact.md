# ADR 0004 — Indicateurs d'impact sur la ville

- **Statut** : accepté
- **Date** : 2026-10-11

## Contexte

Le jeu montre au joueur **ce que sa vie fait à la ville**
(`docs/game/concept.md`). `docs/game/indicateurs-impact.md` listait des
candidats et des questions ouvertes. La v1 n'exige que de l'affichage, sans
rétroaction. Le mainteneur a tranché dans l'issue #18.

## Décision

### 1. Deux indicateurs : Pollution et Inégalités

Pauvreté et Autonomie sont écartées de la v1 (elles restent dans le
[backlog](../../docs/game/backlog.md)).

### 2. Un indicateur par quartier, plus un global

`impactOf(state)` renvoie la valeur de chaque indicateur pour la **ville** et
pour chaque **quartier débloqué**. Chaque valeur est un entier de 0 à 100.

### 3. Affichage seul

- Aucune rétroaction : aucun indicateur n'agit sur le jeu.
- Aucun lien avec la fin de partie, sinon qu'ils sont **affichés dans le bilan**
  (`lifeSummary` les reprend).
- Aucun lien avec le choix légal / illégal (hors v1).

### 4. Calcul dérivé de l'état

Fonction pure de l'état, sans accumulation : pas de champ à sauvegarder, pas de
cas à rejouer. Les constantes sont en données (`src/game/data/impactRules.ts`),
provisoires, à caler en V1-24.

Une entreprise est posée dans le quartier prévu pour son type
(`companyDistricts`) ; si ce quartier n'est pas débloqué, elle se replie sur
les Tilleuls (le quartier de départ).

**Pollution** (industrie et transport). Pour un lieu, on additionne le
potentiel de chaque entreprise qui s'y trouve :

```
charge = Σ exemplaires × (sortie ou capacité) × multiplicateurs × poids du genre
pollution = 100 × charge / (charge + moitié)
```

- poids : production 1, commerce 0,25 (le transport des articles) ;
- `moitié` : la charge qui donne 50 ;
- la ville additionne tous les quartiers.

**Inégalités** (écart entre le personnage et les habitants).

```
fortune = valeur des entreprises possédées (coût d'achat) [+ argent, aux Tilleuls]
inégalités = 100 × fortune / (fortune + richesse des habitants)
```

- l'argent du personnage compte dans son quartier de résidence (les Tilleuls) ;
- la richesse des habitants est une constante par quartier ; celle de la ville
  est leur somme ;
- plus le personnage s'enrichit, plus l'indicateur monte.

Les deux formules sont monotones, saturantes (jamais au-delà de 100) et nulles
au départ.

## Conséquences

- Les tests vérifient la monotonie, les bornes 0–100 et le déterminisme.
- L'interface (V1-20) lit `impactOf` ; le bilan (V1-22) lit `lifeSummary`.
- Ajouter un indicateur = une formule dans `impact/` et ses constantes en
  données ; ajouter une rétroaction demandera un nouvel ADR.
