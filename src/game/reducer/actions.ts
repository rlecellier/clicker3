/** Actions du jeu. Les issues suivantes ajoutent leurs variantes ici. */
export type GameAction =
  | { type: 'addGauge'; amount: number }
  | { type: 'unlockDistrict'; id: string }
  | { type: 'work'; target: string }
  | { type: 'study'; courseId: string }
  | { type: 'sleep' }
  | { type: 'changeJob'; id: string }
  | { type: 'buyCompany'; id: string }
  | { type: 'sellSurplus' }
  | { type: 'buyUpgrade'; id: string }
  | { type: 'setAuto'; action: 'work' | 'sleep'; isEnabled: boolean }
  // Temps réel écoulé (ms), fourni par l'appelant : les règles ne lisent pas l'horloge.
  // Le retour d'absence passe par `resume` (@game/automation), pas par le reducer.
  | { type: 'autoTick'; elapsedMs: number }
  // Rejoue la même vie depuis l'état de départ.
  | { type: 'restart' };
