import { useGameContext } from '@context/GameContext';
import {
  childEventById,
  childEventText,
  describeEffect,
} from '@game/earlyChildhood';

// Événement de la petite enfance qui attend un choix : null tant qu'il n'y en
// a pas. Chaque choix affiche ce qu'il change ; le jeu est arrêté entre-temps.
export const useChildEventPrompt = () => {
  const { state, dispatch } = useGameContext();
  const event = childEventById(state.child.pendingEvent);
  if (event === undefined) {
    return null;
  }
  return {
    title: event.title,
    message: childEventText(state, event),
    choices: event.choices.map((choice, index) => ({
      label: choice.label,
      effects: choice.effects
        .map((effect) => describeEffect(state, effect))
        .join(' · '),
      onChoose: () => {
        dispatch({ type: 'chooseEvent', choice: index });
      },
    })),
  };
};
