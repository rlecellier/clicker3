import { useState } from 'react';
import { useGameContext } from '@context/GameContext';
import { placementById } from '@game/placements';
import type { PlacementId } from '@game/state';
import { appointmentScript } from './script';

type Appointment = { id: PlacementId; step: number };

// Rendez-vous chez le banquier pour ouvrir un compte : `null` tant qu’aucun
// n’est en cours. L’avancement est un état d’interface ; seule la dernière
// réponse (« Merci ») ouvre le compte, par `openPlacement`.
export const useBankerAppointment = () => {
  const { dispatch } = useGameContext();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const start = (id: PlacementId) => {
    setAppointment({ id, step: 0 });
  };

  const placement =
    appointment === null ? undefined : placementById(appointment.id);
  if (appointment === null || placement === undefined) {
    return { dialog: null, start };
  }
  const script = appointmentScript(placement.name);
  const current = script[appointment.step];
  if (current === undefined) {
    return { dialog: null, start };
  }
  const isLast = appointment.step === script.length - 1;

  return {
    dialog: {
      title: `Rendez-vous avec le banquier (${appointment.step + 1}/${script.length})`,
      message: current.banker,
      replies: current.replies,
      leaveLabel: 'Reporter le rendez-vous',
      onReply: () => {
        if (isLast) {
          dispatch({ type: 'openPlacement', id: appointment.id });
          setAppointment(null);
        } else {
          setAppointment({ ...appointment, step: appointment.step + 1 });
        }
      },
      onLeave: () => {
        setAppointment(null);
      },
    },
    start,
  };
};
