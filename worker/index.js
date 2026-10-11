// Proxy OAuth GitHub pour le formulaire de feedback (Cloudflare Worker).
// Le jeu est statique : le secret OAuth ne peut pas vivre côté navigateur.
// Ce worker ouvre la connexion GitHub, échange le code contre un jeton et le
// remet à la fenêtre du jeu par postMessage. Il ne stocke rien.

const stateCookie = 'clicker3_oauth_state';
const messageType = 'clicker3-feedback-auth';

const html = (body, headers = {}) =>
  new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });

// Renvoie le résultat à la fenêtre du jeu, puis ferme la fenêtre de connexion.
const reply = (environment, payload) => {
  const data = JSON.stringify({ type: messageType, ...payload }).replaceAll(
    '<',
    String.raw`\u003c`,
  );
  const origin = JSON.stringify(environment.ALLOWED_ORIGIN);
  return html(
    `<!doctype html><meta charset="utf-8"><title>Connexion</title>` +
      `<p>Vous pouvez fermer cette fenêtre.</p>` +
      `<script>window.opener?.postMessage(${data}, ${origin});window.close();</script>`,
    {
      'set-cookie': `${stateCookie}=; Max-Age=0; Path=/; Secure; HttpOnly`,
    },
  );
};

const login = (request, environment) => {
  const state = crypto.randomUUID();
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', environment.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', new URL('/callback', request.url).href);
  url.searchParams.set('state', state);
  // Vide pour une GitHub App ; `public_repo` pour une OAuth App.
  if (environment.OAUTH_SCOPE) {
    url.searchParams.set('scope', environment.OAUTH_SCOPE);
  }
  return new Response(undefined, {
    status: 302,
    headers: {
      location: url.href,
      'set-cookie': `${stateCookie}=${state}; Max-Age=600; Path=/; Secure; HttpOnly; SameSite=Lax`,
    },
  });
};

const callback = async (request, environment) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code || url.searchParams.get('error')) {
    return reply(environment, { error: 'Connexion refusée.' });
  }

  const state = url.searchParams.get('state');
  const cookie = request.headers.get('cookie') ?? '';
  const expected = new RegExp(`(?:^|; )${stateCookie}=([^;]+)`).exec(
    cookie,
  )?.[1];
  if (!state || state !== expected) {
    return reply(environment, { error: 'Connexion expirée, réessayez.' });
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: environment.GITHUB_CLIENT_ID,
      client_secret: environment.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL('/callback', request.url).href,
    }),
  });
  const result = await response.json();
  return reply(
    environment,
    result.access_token
      ? { token: result.access_token }
      : { error: 'GitHub a refusé la connexion.' },
  );
};

export default {
  fetch: (request, environment) => {
    const { pathname } = new URL(request.url);
    if (pathname === '/login') {
      return login(request, environment);
    }
    return pathname === '/callback'
      ? callback(request, environment)
      : new Response('Not found', { status: 404 });
  },
};
