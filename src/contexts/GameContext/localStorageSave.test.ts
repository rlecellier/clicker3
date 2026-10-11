import { createLocalStorage, SAVE_KEY } from './localStorageSave';

afterEach(() => {
  localStorage.clear();
});

describe('sauvegarde dans localStorage', () => {
  it('écrit puis relit sous la clé de la sauvegarde', () => {
    const storage = createLocalStorage();
    storage.write('{"a":1}');
    expect(localStorage.getItem(SAVE_KEY)).toBe('{"a":1}');
    expect(storage.read()).toBe('{"a":1}');
  });

  it('effacer ne laisse aucune donnée du jeu dans le navigateur', () => {
    const storage = createLocalStorage();
    storage.write('{"a":1}');
    storage.clear();
    expect(localStorage.length).toBe(0);
    expect(storage.read()).toBeNull();
  });

  it('continue sans sauvegarde quand localStorage lève', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    expect(createLocalStorage().read()).toBeNull();
    vi.restoreAllMocks();
  });
});
