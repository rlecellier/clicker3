# Clicker 3

Un idle clicker (jeu incrémental) construit avec React, TypeScript et Vite.

Le jeu en ligne : <https://rlecellier.github.io/clicker3/> (GitHub Pages).

## Démarrer

```sh
npm install
npm run dev      # serveur de dev
npm test         # tests unitaires (Vitest)
npm run e2e      # parcours Playwright
npm run sim      # simulateur d'une vie (équilibrage)
npm run lint && npx tsc --noEmit && npm run format:check
```

## Documentation

- [Vision du projet](docs/vision.md) : le but. L'avancement est suivi dans
  l'issue #29.
- [Stack technique](docs/stack.md) : reprise de clicker 1.
- [Game design d'un idle clicker](docs/game-design/) : recherche et
  questions à trancher.
- [Notre jeu](docs/game/README.md) : concept, périmètre de la v1,
  équilibrage, simulateur.
- [Guide du joueur](docs/guide-utilisateur/README.md) : comment le jeu
  fonctionne, onglet par onglet, pour qui y joue.
- [Guide de style de l'interface](docs/ui/guide-de-style.md) : tokens,
  composants, accessibilité, ton des textes.
- [Conventions de structure](.claude/adr/0001-project-structure.md) (ADR).
