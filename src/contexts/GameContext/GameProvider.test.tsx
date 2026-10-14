import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { autoIntervalMs } from '@game/automation';
import { startState } from '@game/data';
import { wagesDueOf } from '@game/economy';
import { newGame } from '@game/reducer';
import { createMemoryStorage, loadGame, serialize } from '@game/save';
import type { GameState } from '@game/state';
import { GameProvider } from './GameProvider';
import { useGameContext } from './useGameContext';

const START = 1_000_000;

const automated: GameState = {
  ...startState,
  upgrades: ['procedure-travail'],
  autoWork: true,
};

const clock = { time: START, isHidden: false };
const now = () => clock.time;
const advance = (ms: number) => {
  act(() => {
    clock.time += ms;
    vi.advanceTimersByTime(ms);
  });
};

const setHidden = (isNowHidden: boolean) => {
  clock.isHidden = isNowHidden;
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

const setup = (storage = createMemoryStorage()) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameProvider storage={storage} now={now}>
      {children}
    </GameProvider>
  );
  return { storage, ...renderHook(() => useGameContext(), { wrapper }) };
};

beforeEach(() => {
  clock.time = START;
  clock.isHidden = false;
  vi.useFakeTimers();
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => clock.isHidden);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('démarrage', () => {
  it('commence une vie neuve sans sauvegarde', () => {
    const { result } = setup();
    expect(result.current.state.period).toBe(0);
    expect(result.current.state.money).toBe(startState.money);
    expect(result.current.absence).toBeNull();
  });

  it('ignore une sauvegarde illisible', () => {
    const { result } = setup(createMemoryStorage('pas du json'));
    expect(result.current.state.period).toBe(0);
  });

  it('expose les actions des règles', () => {
    const { result } = setup();
    act(() => {
      result.current.dispatch({ type: 'answerBirthday' });
      result.current.dispatch({ type: 'work', target: 'job' });
    });
    expect(wagesDueOf(result.current.state)).toBeGreaterThan(0);
  });
});

describe('chargement et rattrapage', () => {
  it('rattrape l’absence et expose le résumé, que le joueur peut fermer', () => {
    const storage = createMemoryStorage(serialize(automated, START));
    clock.time = START + 10 * autoIntervalMs;
    const { result } = setup(storage);
    expect(result.current.state.period).toBeGreaterThan(automated.period);
    // Cinq actions de travail, cinq pas de sommeil, puis quatre actions.
    expect(result.current.absence?.actions).toBe(14);
    act(() => {
      result.current.dismissAbsence();
    });
    expect(result.current.absence).toBeNull();
  });

  it('ne montre pas de résumé sans action automatique rattrapée', () => {
    const storage = createMemoryStorage(serialize(startState, START));
    clock.time = START + 60_000;
    const { result } = setup(storage);
    expect(result.current.absence).toBeNull();
    expect(result.current.state.money).toBe(startState.money);
  });
});

describe('boucle automatique', () => {
  it('joue les actions automatiques au rythme de l’horloge', () => {
    const storage = createMemoryStorage(serialize(automated, START));
    const { result } = setup(storage);
    advance(autoIntervalMs);
    expect(wagesDueOf(result.current.state)).toBeGreaterThan(0);
  });

  it('ne joue rien onglet caché, puis rattrape au retour', () => {
    const storage = createMemoryStorage(serialize(automated, START));
    const { result } = setup(storage);
    setHidden(true);
    advance(5 * autoIntervalMs);
    expect(wagesDueOf(result.current.state)).toBe(0);
    setHidden(false);
    expect(wagesDueOf(result.current.state)).toBeGreaterThan(0);
    expect(result.current.absence?.actions).toBe(5);
  });
});

describe('sauvegarde', () => {
  it('sauvegarde une partie commencée dans une tranche avant 18 ans', () => {
    const { result, storage } = setup();
    act(() => {
      result.current.startGame(undefined, 'childhood');
    });
    act(() => {
      result.current.dispatch({ type: 'grow' });
    });
    advance(5000);
    const loaded = loadGame(storage);
    expect(loaded?.ok).toBe(true);
    expect(loaded?.ok && loaded.state.lifeSlice).toBe('childhood');
    expect(loaded?.ok && loaded.state.growth).toBe(1);
  });

  it('sauvegarde périodiquement', () => {
    const { storage, result } = setup();
    act(() => {
      result.current.startGame('interim');
    });
    storage.clear();
    advance(5000);
    expect(storage.read()).not.toBeNull();
  });

  it('n’écrit rien tant qu’aucune partie n’est commencée', () => {
    const { storage } = setup();
    advance(5000);
    setHidden(true);
    expect(storage.read()).toBeNull();
  });

  it('écrit la vie neuve au démarrage et l’efface sur demande', () => {
    const { result, storage } = setup();
    expect(result.current.hasSave).toBe(false);
    act(() => {
      result.current.startGame('interim');
    });
    expect(result.current.hasSave).toBe(true);
    expect(storage.read()).not.toBeNull();
    act(() => {
      result.current.eraseSave();
    });
    expect(result.current.hasSave).toBe(false);
    expect(storage.read()).toBeNull();
    advance(5000);
    expect(storage.read()).toBeNull();
  });

  it('recommencer remplace toute la vie sauvegardée, rien ne survit', () => {
    const played: GameState = {
      ...startState,
      period: 120,
      money: 5000,
      reputation: 8,
      companies: { atelier: 2 },
      upgrades: ['cartes-visite'],
      districts: ['tilleuls', 'hauts-fourneaux'],
      flags: { euro: true },
      events: [{ period: 3, id: 'euro', text: 'Un événement.' }],
      stats: { ...startState.stats, metier: 40 },
      autoWork: true,
      status: 'dead',
    };
    const storage = createMemoryStorage(serialize(played, START));
    const { result } = setup(storage);
    expect(result.current.state.period).toBe(120);
    act(() => {
      result.current.startGame('interim');
    });
    const fresh = newGame('interim');
    expect(result.current.state).toEqual(fresh);
    const saved = loadGame(storage);
    expect(saved).toEqual({
      ok: true,
      state: { ...fresh, lastSeenAt: START },
    });
  });

  it('sauvegarde à chaque achat', () => {
    const { result, storage } = setup(
      createMemoryStorage(
        serialize(
          {
            ...startState,
            money: 1_000_000_000,
            stockCapacity: 1_000_000,
            stats: { ...startState.stats, gestion: 1_000_000 },
          },
          START,
        ),
      ),
    );
    const before = storage.read();
    act(() => {
      result.current.dispatch({ type: 'buyCompany', id: 'atelier' });
    });
    expect(result.current.state.companies['atelier']).toBe(1);
    expect(storage.read()).not.toBe(before);
  });

  it('sauvegarde quand l’onglet se cache et avant de quitter', () => {
    const { storage, result } = setup();
    act(() => {
      result.current.startGame('interim');
    });
    storage.clear();
    setHidden(true);
    expect(storage.read()).not.toBeNull();
    storage.clear();
    act(() => {
      dispatchEvent(new Event('beforeunload'));
    });
    expect(storage.read()).not.toBeNull();
  });
});
