import { useState } from 'react';
import { useGameContext } from '@context/GameContext';
import type { PlacementId } from '@game/state';
import { appointmentScript } from './script';

// `step` vaut le nombre de questions posées ; `reaction` est la réaction du
// banquier à la dernière réponse, dite avant la question suivante.
type Appointment = { id: PlacementId; step: number; reaction: string };

// Rendez-vous chez le banquier pour ouvrir un compte : `null` tant qu’aucun
// n’est en cours. L’avancement est un état d’interface ; seul l’écran de fin
// ouvre le compte, par `openPlacement`.
export const useBankerAppointment = () => {
  const { dispatch } = useGameContext();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const start = (id: PlacementId) => {
    setAppointment({ id, step: 0, reaction: '' });
  };

  if (appointment === null) {
    return { dialog: null, start };
  }
  const { steps, farewell } = appointmentScript(appointment.id);
  const current = steps[appointment.step];
  const title = `Rendez-vous avec le banquier (${appointment.step + 1}/${steps.length + 1})`;
  const leave = {
    leaveLabel: 'Reporter le rendez-vous',
    onLeave: () => {
      setAppointment(null);
    },
  };

  // Écran de fin : le banquier réagit à la dernière réponse, puis le compte
  // s’ouvre.
  if (current === undefined) {
    return {
      dialog: {
        title,
        message: appointment.reaction,
        replies: [farewell],
        ...leave,
        onReply: () => {
          dispatch({ type: 'openPlacement', id: appointment.id });
          setAppointment(null);
        },
      },
      start,
    };
  }

  return {
    dialog: {
      title,
      message: `${appointment.reaction} ${current.banker}`.trim(),
      replies: current.replies.map((reply) => reply.label),
      ...leave,
      onReply: (index: number) => {
        setAppointment({
          ...appointment,
          step: appointment.step + 1,
          reaction: current.replies[index]?.reaction ?? '',
        });
      },
    },
    start,
  };
};
