import type { GaugeKind } from '@game/state';
import type { NoveltyTab } from '@game/novelty';

/** Actions du jeu. Les issues suivantes ajoutent leurs variantes ici. */
export type GameAction =
  | { type: 'addGauge'; amount: number; kind: GaugeKind }
  | { type: 'unlockDistrict'; id: string }
  | { type: 'work'; target: string }
  | { type: 'study'; courseId: string }
  | { type: 'changeJob'; id: string }
  | { type: 'buyCompany'; id: string }
  | { type: 'buyWarehouse' }
  | { type: 'sellSurplus' }
  | { type: 'buyUpgrade'; id: string }
  // Coup de pouce temporaire (cure, séminaire, clinique).
  | { type: 'buyBoost'; id: string }
  // Annule une amélioration possédée : ses effets disparaissent, sans remboursement.
  | { type: 'cancelUpgrade'; id: string }
  // Durée du sommeil quotidien (heures entières, de 4 à 9), réglée dans le profil.
  | { type: 'setSleepHours'; hours: number }
  | { type: 'setAuto'; action: 'work'; isEnabled: boolean }
  // Temps réel écoulé (ms), fourni par l'appelant : les règles ne lisent pas l'horloge.
  // Le retour d'absence passe par `resume` (@game/automation), pas par le reducer.
  | { type: 'autoTick'; elapsedMs: number }
  // Le joueur a lu le courrier : plus de message non lu.
  | { type: 'readMail' }
  // Réponse à la promotion proposée : accepter (augmentation) ou refuser.
  | { type: 'answerPromotion'; isAccepted: boolean }
  // Le joueur a ouvert un onglet : ses nouveautés sont vues.
  | { type: 'markSeen'; tab: NoveltyTab }
  // Recommence une vie neuve depuis l'état de départ, avec le premier emploi
  // choisi (un emploi de départ, voir `startingJobs`).
  | { type: 'restart'; jobId?: string };
