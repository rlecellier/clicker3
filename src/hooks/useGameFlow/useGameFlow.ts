import { useGameContext } from '@context/GameContext';

// L'écran où la partie doit se trouver, d'après son état.
export type GameScreen = 'title' | 'absence' | 'end' | 'game';

export const screenPaths: Record<GameScreen | 'newLife', string> = {
  title: '/',
  newLife: '/nouvelle-vie',
  absence: '/absence',
  end: '/fin',
  game: '/jeu',
};

type FlowFacts = { hasSave: boolean; hasAbsence: boolean; isDead: boolean };

// Pas de partie : titre. Un retour d'absence passe avant la fin, qu'il enchaîne.
export const screenOf = ({
  hasSave,
  hasAbsence,
  isDead,
}: FlowFacts): GameScreen => {
  if (!hasSave) {
    return 'title';
  }
  if (hasAbsence) {
    return 'absence';
  }
  return isDead ? 'end' : 'game';
};

export const useGameFlow = (): GameScreen => {
  const { state, absence, hasSave } = useGameContext();
  return screenOf({
    hasSave,
    hasAbsence: absence !== null,
    isDead: state.status === 'dead',
  });
};
