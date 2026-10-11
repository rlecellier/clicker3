import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { isAutoActive, resume } from '@game/automation';
import { reduce } from '@game/reducer';
import type { GameState } from '@game/state';
import { saveGame } from '@game/save';
import { bootGame } from './bootGame';
import { GameContext } from './GameContext';
import { createLocalStorage } from './localStorageSave';
import type {
  GameContextValue,
  GameProviderOptions,
  ProviderAction,
} from './types';

const TICK_MS = 100;
const AUTOSAVE_MS = 5000;

const defaultStorage = createLocalStorage();

const providerReduce = (state: GameState, action: ProviderAction) =>
  action.type === 'load' ? action.state : reduce(state, action);

export const GameProvider = ({
  children,
  storage = defaultStorage,
  now = Date.now,
}: GameProviderOptions) => {
  const [boot] = useState(() => bootGame(storage, now()));
  const [state, dispatch] = useReducer(providerReduce, boot.state);
  const [absence, setAbsence] = useState(boot.absence);
  const [hasSave, setHasSave] = useState(boot.hasSave);
  const [startCount, setStartCount] = useState(0);

  const latestState = useRef(state);
  const latestHasSave = useRef(hasSave);
  useEffect(() => {
    latestState.current = state;
    latestHasSave.current = hasSave;
  }, [state, hasSave]);

  // Sans partie sauvegardée (écran titre), rien n'est écrit.
  const save = useCallback(() => {
    if (latestHasSave.current) {
      saveGame(storage, latestState.current, now());
    }
  }, [storage, now]);

  // Boucle automatique, pause onglet caché, rattrapage au retour.
  useEffect(() => {
    let last = now();
    let hiddenAt: number | null = null;
    const tick = () => {
      if (document.hidden) {
        return;
      }
      const current = now();
      const elapsedMs = current - last;
      last = current;
      const game = latestState.current;
      if (isAutoActive(game, 'work') || game.isSleeping) {
        dispatch({ type: 'autoTick', elapsedMs });
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = now();
        save();
        return;
      }
      last = now();
      if (hiddenAt === null) {
        return;
      }
      const result = resume(
        { ...latestState.current, lastSeenAt: hiddenAt },
        last,
      );
      hiddenAt = null;
      dispatch({ type: 'load', state: result.state });
      if (result.summary.actions > 0) {
        setAbsence(result.summary);
      }
    };
    const tickTimer = setInterval(tick, TICK_MS);
    const saveTimer = setInterval(save, AUTOSAVE_MS);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(tickTimer);
      clearInterval(saveTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', save);
    };
  }, [now, save]);

  // Sauvegarde immédiate à chaque achat et à la mort.
  const saved = useRef({
    companies: state.companies,
    upgrades: state.upgrades,
    status: state.status,
  });
  useEffect(() => {
    const previous = saved.current;
    const isChanged =
      previous.companies !== state.companies ||
      previous.upgrades !== state.upgrades ||
      previous.status !== state.status;
    if (!isChanged) {
      return;
    }
    saved.current = {
      companies: state.companies,
      upgrades: state.upgrades,
      status: state.status,
    };
    save();
  }, [state, save]);

  // La vie neuve est écrite dès qu'elle est rendue.
  useEffect(() => {
    if (startCount > 0) {
      save();
    }
  }, [startCount, save]);

  const startGame = useCallback((jobId: string) => {
    dispatch({ type: 'restart', jobId });
    setAbsence(null);
    setHasSave(true);
    setStartCount((count) => count + 1);
  }, []);

  const eraseSave = useCallback(() => {
    storage.clear();
    dispatch({ type: 'restart' });
    setAbsence(null);
    setHasSave(false);
  }, [storage]);

  const dismissAbsence = useCallback(() => {
    setAbsence(null);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      absence,
      dismissAbsence,
      hasSave,
      startGame,
      eraseSave,
    }),
    [state, absence, dismissAbsence, hasSave, startGame, eraseSave],
  );

  return <GameContext value={value}>{children}</GameContext>;
};
