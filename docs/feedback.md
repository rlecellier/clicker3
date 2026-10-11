# Formulaire de feedback

Un bouton rond fixé en bas à droite ouvre un formulaire. Le joueur se connecte
avec GitHub (compte obligatoire) et le formulaire crée une **issue publique à
son nom** sur `rlecellier/clicker3`, avec le label `feedback`.

## Fonctionnement

1. Le bouton « Se connecter avec GitHub » ouvre une fenêtre sur le worker
   (`worker/index.js`, Cloudflare Worker) → GitHub → retour sur le worker.
2. Le worker échange le code contre un jeton (il est le seul à connaître le
   secret OAuth) et le passe au jeu par `postMessage`, uniquement vers
   `ALLOWED_ORIGIN`. Il ne stocke rien.
3. Le jeu garde le jeton **en mémoire** (jamais en `localStorage`) et appelle
   directement l'API GitHub (`POST /repos/.../issues`), CORS compris.
4. Le label : GitHub ignore `labels` pour un auteur sans droits de triage. Le
   corps de l'issue contient donc un marqueur et le workflow
   `.github/workflows/feedbackLabel.yml` pose le label `feedback`.

Sans `VITE_FEEDBACK_AUTH_URL`, le bouton n'est pas affiché (dev, e2e).

## Mise en place (une fois)

1. **Créer l'app GitHub** (recommandé : pas de droit large sur les repos du
   joueur) : _Settings › Developer settings › GitHub Apps_. Callback URL :
   `https://<worker>.workers.dev/callback`, webhook désactivé, permission
   _Issues : Read & write_, « Expire user authorization tokens » au choix.
   Installer l'app sur `rlecellier/clicker3`. Générer un client secret.
   _Variante OAuth App_ : même callback, et `OAUTH_SCOPE = "public_repo"`
   (le joueur accorde alors l'écriture sur tous ses dépôts publics).
2. **Déployer le worker** : renseigner `GITHUB_CLIENT_ID` dans
   `worker/wrangler.toml`, puis
   `cd worker && npx wrangler secret put GITHUB_CLIENT_SECRET && npx wrangler deploy`.
3. **Brancher le jeu** : variable de dépôt Actions `FEEDBACK_AUTH_URL`
   (`https://<worker>.workers.dev`, sans `/` final), lue par `deploy.yml`.
   En local : `VITE_FEEDBACK_AUTH_URL` dans `.env.local`.
