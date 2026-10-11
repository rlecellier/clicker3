# ADR 0006 — Décisions visuelles de la v1

- **Statut** : accepté
- **Date** : 2026-10-11
- **Issue** : #55

## Contexte

L'UI « logiciel de 1999 » est posée (#21) ; ces choix n'étaient écrits nulle
part. Le guide de style (`docs/ui/guide-de-style.md`) les applique.

## Décision

1. **Pas de mode sombre en v1.** La palette est unique ; `:root` déclare
   `color-scheme: light`. Les tokens de `src/global.css` permettent d'en
   ajouter un plus tard sans toucher aux composants.
2. **La route `/styleguide` n'existe qu'en développement**
   (`import.meta.env.DEV` dans `routes.tsx`). Elle sert à la revue visuelle,
   pas aux joueurs.
3. **Les types de props s'appellent `NomProperties`** (règle ESLint `unicorn`),
   ce qui remplace `NomProps` de l'ADR 0001 § 1 bis pour les composants.

## Conséquences

- Les composants n'utilisent que des tokens ; aucune couleur en dur.
- Un mode sombre ou un thème demandera un nouvel ADR.
