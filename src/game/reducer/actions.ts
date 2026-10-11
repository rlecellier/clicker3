/** Actions du jeu. Les issues suivantes ajoutent leurs variantes ici. */
export type GameAction =
  | { type: 'addGauge'; amount: number }
  | { type: 'unlockDistrict'; id: string }
  | { type: 'work'; target: string }
  | { type: 'study'; courseId: string }
  | { type: 'changeJob'; id: string }
  | { type: 'buyCompany'; id: string }
  | { type: 'buyWarehouse' }
  | { type: 'sellSurplus' }
  | { type: 'buyUpgrade'; id: string }
  // Annule une amélioration possédée : ses effets disparaissent, sans remboursement.
  | { type: 'cancelUpgrade'; id: string }
  | { type: 'setAuto'; action: 'work'; isEnabled: boolean }
  // Temps réel écoulé (ms), fourni par l'appelant : les règles ne lisent pas l'horloge.
  // Le retour d'absence passe par `resume` (@game/automation), pas par le reducer.
  | { type: 'autoTick'; elapsedMs: number }
  // Recommence une vie neuve depuis l'état de départ, avec le premier emploi
  // choisi (un emploi de départ, voir `startingJobs`).
  | { type: 'restart'; jobId?: string };
