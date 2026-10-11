import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { reduce } from '@game/reducer';
import { defaultSaveOptions, deserialize, serialize } from './save';
import type { SaveOptions } from './save';
import { createMemoryStorage, loadGame, saveGame } from './storage';

const played = [
  { type: 'work', target: 'job' },
  { type: 'work', target: 'job' },
  { type: 'addGauge', amount: 250 },
] as const;

let midGame: GameState = startState;
for (const action of played) {
  midGame = reduce(midGame, action);
}

const failure = (text: string) => {
  const result = deserialize(text);
  return result.ok ? undefined : result.reason;
};

const withoutKey = <Key extends keyof GameState>(key: Key) =>
  Object.fromEntries(
    Object.entries(startState).filter(([name]) => name !== key),
  );

describe('serialize / deserialize', () => {
  it('fait un aller-retour identique', () => {
    const result = deserialize(serialize(midGame, 1234));
    expect(result).toEqual({
      ok: true,
      state: { ...midGame, lastSeenAt: 1234 },
    });
  });

  it('garde un état identique quand l’horodatage est déjà celui de l’état', () => {
    const stamped = { ...midGame, lastSeenAt: 99 };
    const result = deserialize(serialize(stamped, 99));
    expect(result).toEqual({ ok: true, state: stamped });
  });

  it('conserve un personnage mort', () => {
    const dead: GameState = { ...midGame, status: 'dead', period: 684 };
    const result = deserialize(serialize(dead, 5));
    expect(result.ok && result.state.status).toBe('dead');
    expect(result.ok && result.state.period).toBe(684);
  });

  it('écrit le numéro de version', () => {
    const parsed: unknown = JSON.parse(serialize(startState, 0));
    expect(parsed).toMatchObject({
      version: defaultSaveOptions.currentVersion,
    });
  });
});

describe('rejet sans planter', () => {
  it.each(['', 'pas du json', '{"version":1,"state":', '{'])(
    'rejette le JSON invalide %j',
    (text) => {
      expect(failure(text)).toBe('invalid-json');
    },
  );

  it.each(['null', '[]', '42', '{}', '{"version":1}', '{"state":{}}'])(
    'rejette la forme incorrecte %s',
    (text) => {
      expect(failure(text)).toBe('invalid-format');
    },
  );

  it('rejette une version inconnue (plus récente)', () => {
    const text = JSON.stringify({ version: 99, state: startState });
    expect(failure(text)).toBe('unknown-version');
  });

  it.each([0, -1, 1.5])('rejette le numéro de version %d', (version) => {
    const text = JSON.stringify({ version, state: startState });
    expect(failure(text)).toBe('unknown-version');
  });

  it('rejette un champ manquant', () => {
    const text = JSON.stringify({ version: 1, state: withoutKey('money') });
    expect(failure(text)).toBe('invalid-state');
  });

  it('rejette un champ du mauvais type', () => {
    const text = JSON.stringify({
      version: 1,
      state: { ...startState, money: 'beaucoup' },
    });
    expect(failure(text)).toBe('invalid-state');
  });

  it('rejette un sous-champ manquant', () => {
    const text = JSON.stringify({
      version: 1,
      state: { ...startState, stats: { metier: 0 } },
    });
    expect(failure(text)).toBe('invalid-state');
  });

  it('rejette un statut, une phase ou un marqueur inconnus', () => {
    for (const changes of [
      { status: 'zombie' },
      { phase: 'retraite' },
      { markers: ['chance'] },
    ]) {
      const text = JSON.stringify({
        version: 1,
        state: { ...startState, ...changes },
      });
      expect(failure(text)).toBe('invalid-state');
    }
  });

  it('accepte les champs qui valent null au départ', () => {
    const state = {
      ...startState,
      jobId: null,
      lastSeenAt: 12,
      lastStatement: null,
    };
    const text = JSON.stringify({ version: 1, state });
    expect(deserialize(text)).toEqual({ ok: true, state });
  });
});

const legacy = () =>
  JSON.stringify({
    version: 1,
    state: { ...withoutKey('lastSeenAt'), money: 777 },
  });

describe('contenu corrompu', () => {
  it.each([
    ['un compteur qui n’est pas un nombre', { companies: { atelier: 'x' } }],
    ['une entreprise inconnue', { companies: { fantome: 1 } }],
    ['un multiplicateur infini', { companyMultipliers: { atelier: Infinity } }],
    ['un bonus de travail inconnu', { workBoosts: { fantome: 1 } }],
    [
      'un facteur de salaire sur un emploi inconnu',
      { jobSalaryFactors: { x: 1 } },
    ],
    ['un drapeau qui n’est pas un booléen', { flags: { vu: 'oui' } }],
    ['une amélioration qui n’est pas un id', { upgrades: [42] }],
    ['une amélioration inconnue', { upgrades: ['fantome'] }],
    ['un quartier inconnu', { districts: ['atlantide'] }],
    ['un événement unique inconnu', { firedEvents: ['fantome'] }],
    ['un emploi inconnu', { jobId: 'roi' }],
    [
      'une ligne de journal sans texte',
      { events: [{ period: 1, id: 'euro' }] },
    ],
    [
      'un effet temporaire d’un genre inconnu',
      { activeEffects: [{ eventId: 'x', kind: 'magie', value: 1, until: 2 }] },
    ],
  ])('rejette %s', (_name, changes) => {
    const text = JSON.stringify({
      version: 1,
      state: { ...startState, ...changes },
    });
    expect(failure(text)).toBe('invalid-state');
  });

  it('accepte un état joué, avec journal, effets et drapeaux', () => {
    const state = {
      ...midGame,
      flags: { vu: true },
      activeEffects: [
        {
          eventId: 'bulle-internet',
          kind: 'sales' as const,
          value: 0.2,
          until: 50,
        },
      ],
    };
    expect(deserialize(serialize(state, 1))).toEqual({
      ok: true,
      state: { ...state, lastSeenAt: 1 },
    });
  });
});

describe('migration de la version 1', () => {
  it('retire le sommeil automatique et endort personne', () => {
    const text = JSON.stringify({
      version: 1,
      state: {
        ...withoutKey('isSleeping'),
        version: 1,
        autoSleep: true,
        upgrades: ['procedure-travail', 'rythme-sommeil'],
      },
    });
    const result = deserialize(text);
    expect(result.ok && result.state.upgrades).toEqual(['procedure-travail']);
    expect(result.ok && result.state.isSleeping).toBe(false);
    expect(result.ok && result.state.version).toBe(startState.version);
    expect(result.ok && 'autoSleep' in result.state).toBe(false);
  });
});

describe('migrations', () => {
  const v2: SaveOptions = {
    currentVersion: 2,
    // Version 1 fictive : pas encore de `lastSeenAt`.
    migrations: { 1: (raw) => ({ ...raw, lastSeenAt: null }) },
  };

  it('migre une ancienne version vers la courante', () => {
    const result = deserialize(legacy(), v2);
    expect(result.ok && result.state.money).toBe(777);
    expect(result.ok && result.state.lastSeenAt).toBeNull();
    expect(result.ok && result.state.version).toBe(2);
  });

  it('refuse l’ancienne version sans migration', () => {
    const result = deserialize(legacy(), { ...v2, migrations: {} });
    expect(result).toEqual({ ok: false, reason: 'unknown-version' });
  });

  it('enchaîne plusieurs migrations', () => {
    const calls: number[] = [];
    const options: SaveOptions = {
      currentVersion: 3,
      migrations: {
        1: (raw) => {
          calls.push(1);
          return { ...raw, lastSeenAt: null };
        },
        2: (raw) => {
          calls.push(2);
          return raw;
        },
      },
    };
    expect(deserialize(legacy(), options).ok).toBe(true);
    expect(calls).toEqual([1, 2]);
  });

  it('refuse une version plus récente que la courante', () => {
    const text = JSON.stringify({ version: 3, state: startState });
    expect(deserialize(text, v2)).toEqual({
      ok: false,
      reason: 'unknown-version',
    });
  });
});

describe('stockage', () => {
  it('sauvegarde puis recharge', () => {
    const storage = createMemoryStorage();
    expect(loadGame(storage)).toBeNull();
    saveGame(storage, midGame, 500);
    expect(loadGame(storage)).toEqual({
      ok: true,
      state: { ...midGame, lastSeenAt: 500 },
    });
  });

  it('signale une sauvegarde corrompue sans planter', () => {
    const storage = createMemoryStorage('{"cassé');
    expect(loadGame(storage)).toEqual({ ok: false, reason: 'invalid-json' });
  });

  it('efface la sauvegarde', () => {
    const storage = createMemoryStorage();
    saveGame(storage, midGame, 1);
    storage.clear();
    expect(loadGame(storage)).toBeNull();
  });
});
