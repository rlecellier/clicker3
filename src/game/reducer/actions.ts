import type { GaugeKind, LifeSliceId, PlacementId } from '@game/state';
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
  // Place de l'argent du compte courant, ou le reprend (jamais bloqué).
  | { type: 'buyUpgrade'; id: string }
  // Coup de pouce temporaire (cure, séminaire, clinique).
  | { type: 'buyBoost'; id: string }
  // Annule une amélioration possédée : ses effets disparaissent, sans remboursement.
  | { type: 'cancelUpgrade'; id: string }
  // Durée du sommeil quotidien (court 4 h, moyen 6 h, long 8 h), réglée dans l'onglet Vie.
  | { type: 'setSleepHours'; hours: number }
  | { type: 'setAuto'; action: 'work'; isEnabled: boolean }
  // Temps réel écoulé (ms), fourni par l'appelant : les règles ne lisent pas l'horloge.
  // Le retour d'absence passe par `resume` (@game/automation), pas par le reducer.
  | { type: 'autoTick'; elapsedMs: number }
  // Rendez-vous chez le banquier terminé : le compte d'épargne s'ouvre.
  | { type: 'openPlacement'; id: PlacementId }
  // Le joueur a lu le courrier : plus de message non lu.
  | { type: 'readMail' }
  // Réponse à la promotion proposée : accepter (augmentation) ou refuser.
  | { type: 'answerPromotion'; isAccepted: boolean }
  // Le joueur a fermé la fenêtre d'un anniversaire symbolique.
  | { type: 'answerBirthday' }
  // Le joueur a lu la pop-up de la dernière amélioration.
  | { type: 'acknowledgeFinalUpgrade' }
  // Le joueur a ouvert un onglet : ses nouveautés sont vues.
  | { type: 'markSeen'; tab: NoveltyTab }
  // Recommence une vie neuve depuis l'état de départ, avec le premier emploi
  // choisi (un emploi de départ, voir `startingJobs`).
  // Le bouton d'une tranche avant 18 ans : le compteur monte d'un cran.
  | { type: 'grow' }
  // Une activité de la petite enfance : un axe se déplace vers son pôle.
  | { type: 'doActivity'; id: string }
  // `lifeSlice` : la tranche de vie où commencer (Jeunesse par défaut).
  // `birthSituation` : la situation de naissance (famille standard par défaut).
  | {
      type: 'restart';
      jobId?: string;
      lifeSlice?: LifeSliceId;
      birthSituation?: string;
    };
