import { startState } from '@game/data';
import type { GameState } from '@game/state';
import { reduce } from '@game/reducer';
import { defaultSaveOptions, deserialize, serialize } from './save';
import type { SaveOptions } from './save';
import { createMemoryStorage, loadGame, saveGame } from './storage';

const played = [
  { type: 'work', target: 'job' },
  { type: 'work', target: 'job' },
  { type: 'addGauge', amount: 250, kind: 'work' },
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

  it('conserve un personnage mort, un journal, des effets et des drapeaux', () => {
    const state: GameState = {
      ...midGame,
      status: 'dead',
      period: 684,
      flags: { vu: true },
      activeEffects: [
        {
          eventId: 'bulle-internet',
          kind: 'sales',
          value: 0.2,
          until: 50,
        },
      ],
    };
    expect(deserialize(serialize(state, 5))).toEqual({
      ok: true,
      state: { ...state, lastSeenAt: 5 },
    });
  });

  it('conserve une petite enfance en cours et l’héritage de l’Enfance', () => {
    const child: GameState = {
      ...startState,
      lifeSlice: 'earlyChildhood',
      relations: [
        { id: 'mother', name: 'Maman', role: 'mère', kind: 'family', bond: 30 },
      ],
      child: {
        ...startState.child,
        objects: ['teddy'],
        traits: ['stubborn'],
        firedEvents: ['firstWord'],
        pendingEvent: 'puzzle',
        later: [{ id: 'bike', at: 18 }],
      },
    };
    expect(deserialize(serialize(child, 5))).toEqual({
      ok: true,
      state: { ...child, lastSeenAt: 5 },
    });
    const inherited: GameState = {
      ...startState,
      lifeSlice: 'childhood',
      carry: {
        axes: { energy: 40, sociability: -10, mind: 0, bond: 22 },
        traits: ['sly'],
        objects: ['cat'],
        events: 5,
      },
    };
    expect(deserialize(serialize(inherited, 7))).toEqual({
      ok: true,
      state: { ...inherited, lastSeenAt: 7 },
    });
  });

  it('écrit le numéro de version', () => {
    const parsed: unknown = JSON.parse(serialize(startState, 0));
    expect(parsed).toMatchObject({
      version: defaultSaveOptions.currentVersion,
    });
  });

  it('accepte les champs qui valent null au départ', () => {
    const state = {
      ...startState,
      jobId: null,
      lastSeenAt: 12,
      lastStatement: null,
    };
    const text = JSON.stringify({ version: startState.version, state });
    expect(deserialize(text)).toEqual({ ok: true, state });
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

  it.each([99, 0, -1, 1.5])('rejette le numéro de version %d', (version) => {
    const text = JSON.stringify({ version, state: startState });
    expect(failure(text)).toBe('unknown-version');
  });
});

const legacy = () =>
  JSON.stringify({
    version: 1,
    state: { ...withoutKey('lastSeenAt'), money: 777 },
  });

describe('contenu corrompu', () => {
  it.each([
    ['un champ manquant', { money: undefined }],
    ['un champ du mauvais type', { money: 'beaucoup' }],
    ['un sous-champ manquant', { stats: { metier: 0 } }],
    ['un statut inconnu', { status: 'zombie' }],
    ['une phase inconnue', { phase: 'retraite' }],
    ['un marqueur inconnu', { markers: ['chance'] }],
    ['un compteur qui n’est pas un nombre', { companies: { atelier: 'x' } }],
    ['une entreprise inconnue', { companies: { fantome: 1 } }],
    [
      'un facteur de salaire infini',
      { jobSalaryFactors: { interim: Infinity } },
    ],
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
    ['une situation de naissance inconnue', { birthSituation: 'roi' }],
    [
      'un objet d’enfant inconnu',
      { child: { ...startState.child, objects: ['x'] } },
    ],
    ['un trait inconnu', { child: { ...startState.child, traits: ['x'] } }],
    [
      'un événement en attente inconnu',
      { child: { ...startState.child, pendingEvent: 'x' } },
    ],
    ['une personne sans lien', { relations: [{ id: 'a' }] }],
    ['un héritage incomplet', { carry: { events: 1 } }],
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
      version: startState.version,
      state: { ...startState, ...changes },
    });
    expect(failure(text)).toBe('invalid-state');
  });
});

describe('coups de pouce actifs', () => {
  it('survivent à une sauvegarde', () => {
    const boosted: GameState = {
      ...startState,
      activeEffects: [
        { eventId: 'cure-ginkgo', kind: 'markerChance', value: 0.1, until: 3 },
        {
          eventId: 'clinique-sommeil',
          kind: 'sleepBoost',
          value: 1,
          until: 12,
        },
      ],
    };
    expect(deserialize(serialize(boosted, 0))).toEqual({
      ok: true,
      state: { ...boosted, lastSeenAt: 0 },
    });
  });

  it('rejette un effet de genre inconnu', () => {
    const broken = {
      ...startState,
      activeEffects: [{ eventId: 'x', kind: 'inconnu', value: 1, until: 3 }],
    };
    expect(deserialize(JSON.stringify({ version: 12, state: broken })).ok).toBe(
      false,
    );
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
