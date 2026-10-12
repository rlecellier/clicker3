import { startState } from '@game/data';
import { unreadMail } from '@game/mail';
import { newItems, noveltyTabs } from '@game/novelty';
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
    const text = JSON.stringify({ version: 1, state });
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

describe('migration de la version 2', () => {
  it('ajoute le détail du stock au ledger', () => {
    const { stockIn, stockOut, ...figures } = startState.ledger.total;
    expect({ stockIn, stockOut }).toEqual({ stockIn: {}, stockOut: {} });
    const old = { ...figures, stockProduced: 7 };
    const text = JSON.stringify({
      version: 2,
      state: {
        ...startState,
        version: 2,
        ledger: { current: old, last: old, total: old },
      },
    });
    const result = deserialize(text);
    expect(result.ok && result.state.ledger.total.stockIn).toEqual({});
    expect(result.ok && result.state.ledger.total.stockProduced).toBe(7);
  });
});

describe('migration de la version 4', () => {
  it('ajoute les intérêts au ledger', () => {
    const { interest, ...figures } = startState.ledger.total;
    expect(interest).toBe(0);
    const old = { ...figures, rent: 900 };
    const text = JSON.stringify({
      version: 4,
      state: {
        ...startState,
        version: 4,
        ledger: { current: old, last: old, total: old },
      },
    });
    const result = deserialize(text);
    expect(result.ok && result.state.ledger.total.interest).toBe(0);
    expect(result.ok && result.state.ledger.total.rent).toBe(900);
  });
});

describe('migration de la version 5', () => {
  it('initialise les compteurs de courrier sans message non lu', () => {
    const { mailReceived, mailRead, ...old } = startState;
    expect({ mailReceived, mailRead }).toEqual({
      mailReceived: 0,
      mailRead: 0,
    });
    const text = JSON.stringify({
      version: 5,
      state: {
        ...old,
        version: 5,
        events: [
          { period: 1, id: 'a', text: 'Un' },
          { period: 2, id: 'b', text: 'Deux' },
        ],
      },
    });
    const result = deserialize(text);
    expect(result.ok && result.state.mailReceived).toBe(2);
    expect(result.ok && result.state.mailRead).toBe(2);
    expect(result.ok && unreadMail(result.state)).toBe(0);
  });
});

describe('migration de la version 6', () => {
  it('considère comme vu tout ce qui est déjà débloqué', () => {
    const { seenItems, ...old } = startState;
    expect(seenItems.jobs).toEqual([]);
    const text = JSON.stringify({
      version: 6,
      state: {
        ...old,
        version: 6,
        stats: { metier: 9, gestion: 2, intelligence: 0, endurance: 0 },
      },
    });
    const result = deserialize(text);
    expect(result.ok && result.state.seenItems.jobs).toEqual([
      'job:polyvalent',
    ]);
    expect(result.ok && newItems(result.state, 'invest')).toEqual([]);
    expect(result.ok && newItems(result.state, 'skills')).toEqual([]);
    expect(result.ok && result.state.seenItems.skills).toContain(
      'stat:metier:2',
    );
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

describe('migration de la version 11', () => {
  const v11 = {
    ...startState,
    version: 11,
    stats: { metier: 120, gestion: 40, intelligence: 90, endurance: 12 },
    upgrades: ['stage-posture', 'carnet-notes', 'application-productivite'],
    seenItems: {
      ...startState.seenItems,
      invest: ['upgrade:carnet-notes', 'company:atelier'],
    },
  };

  it('renomme le carnet et l’application, sans perdre les points de stat', () => {
    const result = deserialize(JSON.stringify({ version: 11, state: v11 }));
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const { state } = result;
    expect(state.upgrades).toEqual([
      'stage-posture',
      'agenda-electronique',
      'assistante-direction',
    ]);
    expect(state.seenItems.invest).toEqual([
      'upgrade:agenda-electronique',
      'company:atelier',
    ]);
    expect(state.stats).toEqual(v11.stats);
    expect(state.maxMarkers).toBe(startState.maxMarkers);
    expect(state.productionMultiplier).toBeCloseTo(1.3);
    expect(state.payroll).toBe(800);
  });
});

// Sauvegarde écrite par le code de la v1 (commit e8cd2a1), version 5.
const saveV5 = `{
  "version": 5,
  "state": {
    "version": 5,
    "lastSeenAt": 915148800000,
    "characterName": "Camille Morel",
    "life": {
      "startAge": 18,
      "seniorAge": 60,
      "deathAge": 75,
      "startYear": 1999,
      "startMonth": 1
    },
    "period": 4,
    "gauge": 0,
    "gaugeCapacity": 70,
    "status": "playing",
    "phase": "youngAdult",
    "money": -1150,
    "stock": 0,
    "stockCapacity": 50,
    "warehouses": 0,
    "reputation": 0,
    "reputationEarned": 0.6000000000000001,
    "stats": { "metier": 0, "gestion": 0, "intelligence": 0, "endurance": 0 },
    "markers": [],
    "maxMarkers": 5,
    "isSleeping": false,
    "queuedActions": [],
    "sleepMultiplier": 1,
    "seed": 3599192428,
    "jobId": "interim",
    "housingId": "studio",
    "rent": 300,
    "payroll": 0,
    "companies": {},
    "upgrades": [],
    "productionMultiplier": 1,
    "salesMultiplier": 1,
    "workBoosts": {},
    "companyMultipliers": {},
    "workReputationMultiplier": 1,
    "reputationPerSaleMultiplier": 1,
    "lastStatement": {
      "period": 3,
      "paidExpenses": true,
      "unpaid": true,
      "stockout": false,
      "stockFull": false
    },
    "ledger": {
      "current": {
        "wages": 0,
        "sales": 0,
        "surplus": 0,
        "otherIncome": 0,
        "rent": 0,
        "payroll": 0,
        "purchases": 0,
        "studies": 0,
        "otherExpenses": 0,
        "interest": 0,
        "stockProduced": 0,
        "stockSold": 0,
        "stockLost": 0,
        "stockIn": {},
        "stockOut": {},
        "reputationGained": 0,
        "reputationLost": 0,
        "reputationSpent": 0
      },
      "last": {
        "wages": 60,
        "sales": 0,
        "surplus": 0,
        "otherIncome": 0,
        "rent": 300,
        "payroll": 0,
        "purchases": 0,
        "studies": 0,
        "otherExpenses": 0,
        "interest": 55,
        "stockProduced": 0,
        "stockSold": 0,
        "stockLost": 0,
        "stockIn": {},
        "stockOut": {},
        "reputationGained": 0.2,
        "reputationLost": 0.2,
        "reputationSpent": 0
      },
      "total": {
        "wages": 180,
        "sales": 0,
        "surplus": 0,
        "otherIncome": 0,
        "rent": 1200,
        "payroll": 0,
        "purchases": 0,
        "studies": 0,
        "otherExpenses": 0,
        "interest": 130,
        "stockProduced": 0,
        "stockSold": 0,
        "stockLost": 0,
        "stockIn": {},
        "stockOut": {},
        "reputationGained": 0.6000000000000001,
        "reputationLost": 0.6000000000000001,
        "reputationSpent": 0
      }
    },
    "districts": ["tilleuls"],
    "flags": {},
    "events": [
      {
        "period": 0,
        "id": "euro",
        "text": "Bienvenue dans l'euro. Votre compte est crédité de 0 €, ce qui est un bon début."
      },
      {
        "period": 0,
        "id": "age-18",
        "text": "Vous êtes majeur. Les offres de crédit aussi."
      },
      {
        "period": 1,
        "id": "loyer",
        "text": "Votre bail a été renouvelé à des conditions plus ambitieuses."
      },
      {
        "period": 1,
        "id": "impaye",
        "text": "Votre propriétaire a pris acte de votre situation. Il vous souhaite du courage."
      },
      {
        "period": 2,
        "id": "loyer",
        "text": "Votre bail a été renouvelé à des conditions plus ambitieuses."
      },
      {
        "period": 2,
        "id": "impaye",
        "text": "Votre propriétaire a pris acte de votre situation. Il vous souhaite du courage."
      },
      {
        "period": 3,
        "id": "loyer",
        "text": "Votre bail a été renouvelé à des conditions plus ambitieuses."
      },
      {
        "period": 3,
        "id": "impaye",
        "text": "Votre propriétaire a pris acte de votre situation. Il vous souhaite du courage."
      },
      {
        "period": 4,
        "id": "loyer",
        "text": "Votre bail a été renouvelé à des conditions plus ambitieuses."
      },
      {
        "period": 4,
        "id": "impaye",
        "text": "Votre propriétaire a pris acte de votre situation. Il vous souhaite du courage."
      }
    ],
    "firedEvents": ["euro", "age-18"],
    "activeEffects": [],
    "jobSalaryFactors": {},
    "autoWork": false,
    "autoElapsed": 0
  }
}`;

describe('sauvegarde réelle de la v1 (version 5)', () => {
  it('traverse toutes les migrations jusqu’à la version courante', () => {
    expect(JSON.parse(saveV5).version).toBe(5);
    const result = deserialize(saveV5);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const { state } = result;
    expect(state.version).toBe(defaultSaveOptions.currentVersion);
    expect(state.version).toBe(startState.version);
    // Les données de la v1 sont conservées.
    expect(state.period).toBe(4);
    expect(state.money).toBe(-1150);
    // Version 6 : compteurs de courrier, tout est lu.
    expect(state.mailReceived).toBe(state.events.length);
    expect(unreadMail(state)).toBe(0);
    // Version 8 : `last` devient l’historique (période 3 = dernière jouée).
    expect(state.ledger.history).toHaveLength(1);
    expect(state.ledger.history[0]?.period).toBe(3);
    // Version 7 : rien n’est une nouveauté.
    for (const tab of noveltyTabs) {
      expect(newItems(state, tab)).toEqual([]);
    }
  });
});

const loadV7 = () => {
  expect(JSON.parse(saveV7).version).toBe(7);
  const result = deserialize(saveV7);
  expect(result.ok).toBe(true);
  return result.ok ? result.state : startState;
};

// Sauvegarde écrite par le code de la version 7 (entreprises, entrepôt et trois
// périodes jouées).
const saveV7 = `{
  "version": 7,
  "state": {
    "version": 7,
    "characterName": "Camille Morel",
    "life": {
      "startAge": 18,
      "seniorAge": 60,
      "deathAge": 75,
      "startYear": 1999,
      "startMonth": 1
    },
    "period": 3,
    "gauge": 0,
    "gaugeCapacity": 70,
    "status": "playing",
    "phase": "entrepreneur",
    "money": 99216,
    "stock": 75,
    "stockCapacity": 75,
    "warehouses": 1,
    "reputation": 0.36,
    "reputationEarned": 0.36,
    "stats": {
      "metier": 0,
      "gestion": 0,
      "intelligence": 0,
      "endurance": 0
    },
    "markers": [],
    "maxMarkers": 5,
    "isSleeping": false,
    "queuedActions": [],
    "sleepMultiplier": 1,
    "seed": 1999,
    "jobId": "interim",
    "housingId": "studio",
    "rent": 300,
    "payroll": 0,
    "companies": {
      "atelier": 3,
      "manufacture": 1,
      "boutique": 2
    },
    "upgrades": [],
    "productionMultiplier": 1,
    "salesMultiplier": 1,
    "workBoosts": {},
    "companyMultipliers": {},
    "workReputationMultiplier": 1,
    "reputationPerSaleMultiplier": 1,
    "lastStatement": {
      "period": 2,
      "paidExpenses": true,
      "unpaid": false,
      "stockout": false,
      "stockFull": true
    },
    "ledger": {
      "current": {
        "wages": 0,
        "sales": 0,
        "surplus": 0,
        "otherIncome": 0,
        "rent": 0,
        "payroll": 0,
        "purchases": 0,
        "studies": 0,
        "otherExpenses": 0,
        "interest": 0,
        "stockProduced": 0,
        "stockSold": 0,
        "stockLost": 0,
        "stockIn": {},
        "stockOut": {},
        "reputationGained": 0,
        "reputationLost": 0,
        "reputationSpent": 0
      },
      "last": {
        "wages": 0,
        "sales": 72,
        "surplus": 0,
        "otherIncome": 0,
        "rent": 300,
        "payroll": 0,
        "purchases": 0,
        "studies": 0,
        "otherExpenses": 0,
        "interest": 0,
        "stockProduced": 105,
        "stockSold": 6,
        "stockLost": 99,
        "stockIn": {
          "atelier": 6,
          "manufacture": 99
        },
        "stockOut": {
          "boutique": 6
        },
        "reputationGained": 0.12,
        "reputationLost": 0,
        "reputationSpent": 0
      },
      "total": {
        "wages": 0,
        "sales": 216,
        "surplus": 0,
        "otherIncome": 0,
        "rent": 900,
        "payroll": 0,
        "purchases": 100,
        "studies": 0,
        "otherExpenses": 0,
        "interest": 0,
        "stockProduced": 315,
        "stockSold": 18,
        "stockLost": 222,
        "stockIn": {
          "atelier": 18,
          "manufacture": 297
        },
        "stockOut": {
          "boutique": 18
        },
        "reputationGained": 0.36,
        "reputationLost": 0,
        "reputationSpent": 0
      }
    },
    "districts": [
      "tilleuls"
    ],
    "flags": {},
    "events": [
      {
        "period": 1,
        "id": "euro",
        "text": "Bienvenue dans l'euro. Votre compte est crédité de 0 €, ce qui est un bon début."
      },
      {
        "period": 1,
        "id": "age-18",
        "text": "Vous êtes majeur. Les offres de crédit aussi."
      },
      {
        "period": 1,
        "id": "loyer",
        "text": "Votre bail a été renouvelé à des conditions plus ambitieuses."
      },
      {
        "period": 1,
        "id": "premiere-entreprise",
        "text": "Vous êtes porteur de projet. Personne ne vous demande lequel."
      },
      {
        "period": 1,
        "id": "stock-plein",
        "text": "Votre entrepôt déborde. La production continue, par principe."
      },
      {
        "period": 2,
        "id": "loyer",
        "text": "Votre bail a été renouvelé à des conditions plus ambitieuses."
      },
      {
        "period": 2,
        "id": "stock-plein",
        "text": "Votre entrepôt déborde. La production continue, par principe."
      },
      {
        "period": 3,
        "id": "loyer",
        "text": "Votre bail a été renouvelé à des conditions plus ambitieuses."
      },
      {
        "period": 3,
        "id": "stock-plein",
        "text": "Votre entrepôt déborde. La production continue, par principe."
      }
    ],
    "mailReceived": 9,
    "mailRead": 0,
    "seenItems": {
      "skills": [],
      "jobs": [],
      "invest": [],
      "city": []
    },
    "firedEvents": [
      "euro",
      "age-18",
      "premiere-entreprise"
    ],
    "activeEffects": [],
    "jobSalaryFactors": {},
    "autoWork": false,
    "autoElapsed": 0,
    "lastSeenAt": 1234
  }
}`;

describe('migration de la version 7', () => {
  it('fait de `last` l’unique entrée de l’historique', () => {
    const old = JSON.parse(saveV7).state.ledger.last;
    const { ledger, period } = loadV7();
    expect(period).toBe(3);
    expect(ledger.history).toHaveLength(1);
    expect(ledger.history[0]?.period).toBe(2);
    expect(ledger.history[0]?.figures).toMatchObject(old);
    expect(ledger.history[0]?.figures.salesBy).toEqual({});
    expect('last' in ledger).toBe(false);
  });

  it('conserve les totaux, vide les ventilations et déduit le stock de départ', () => {
    const { ledger, stock } = loadV7();
    const { current } = ledger;
    expect(ledger.total).toMatchObject(JSON.parse(saveV7).state.ledger.total);
    expect(ledger.total.purchasesBy).toEqual({});
    expect(current.wagesBy).toEqual({});
    expect(
      current.stockStart +
        current.stockProduced -
        current.stockSold -
        current.stockLost,
    ).toBe(stock);
  });

  it('n’a pas de période terminée si la partie est au départ', () => {
    const old = JSON.parse(saveV7);
    old.state.period = 0;
    const result = deserialize(JSON.stringify(old));
    expect(result.ok && result.state.ledger.history).toEqual([]);
  });
});

// Une partie v9 : studio rénové, étagères (×13), puis un petit entrepôt
// acheté après elles (+25 non agrandi), loyer augmenté par l'euro (×1,05).
const saveV9 = () => {
  const state: Record<string, unknown> = {
    ...startState,
    version: 9,
    upgrades: ['studio-renove', 'etageres-kit'],
    housingId: 'studio-renove',
    sleepMultiplier: 1.5,
    warehouses: 1,
    stockCapacity: 50 * 13 + 25,
    rent: Math.round((300 + 34) * 1.05),
  };
  delete state.rentFactor;
  delete state.payrollFactor;
  return JSON.stringify({ version: 9, state });
};

describe('migration de la version 9', () => {
  it('garde le loyer et en déduit le facteur des événements', () => {
    const result = deserialize(saveV9());
    expect(result.ok && result.state.rent).toBe(Math.round(334 * 1.05));
    expect(result.ok && result.state.rentFactor).toBeCloseTo(351 / 334);
    expect(result.ok && result.state.payrollFactor).toBe(1);
  });

  it('agrandit aussi les petits entrepôts : la capacité ne baisse jamais', () => {
    const result = deserialize(saveV9());
    expect(result.ok && result.state.stockCapacity).toBe((50 + 25) * 13);
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
