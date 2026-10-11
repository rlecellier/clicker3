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
  | { type: 'buyUpgrade'; id: string };
