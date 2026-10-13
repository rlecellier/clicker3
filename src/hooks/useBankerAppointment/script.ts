import type { PlacementId } from '@game/state';

// Une réponse du joueur et la réaction du banquier, dite avant la suite.
export type BankerReply = {
  label: string;
  reaction: string;
};

// Une réplique du banquier et les réponses possibles (aucune ne fait perdre :
// on ne gagne pas contre un banquier, le compte s’ouvre toujours).
export type BankerStep = {
  banker: string;
  replies: readonly BankerReply[];
};

export type BankerScript = {
  steps: readonly BankerStep[];
  // Dernier mot du joueur, une fois la réaction à la dernière réponse lue : il
  // ouvre le compte.
  farewell: string;
};

// Un rendez-vous par compte, de plus en plus long à mesure que le compte est
// sérieux (2 à 5 questions, plus l’écran de fin).
const scripts: Record<PlacementId, BankerScript> = {
  savings: {
    steps: [
      {
        banker:
          'Un Livret A ! Le placement préféré des Français, faute de connaître le suivant. Vous venez pour la sécurité ?',
        replies: [
          {
            label: 'Oui, je veux dormir tranquille.',
            reaction:
              'Très sage. Vous dormirez, votre argent aussi, c’est l’idée.',
          },
          {
            label: 'Non, pour les intérêts.',
            reaction:
              'Ah ! L’humour, à cette heure. Gardez-le, c’est gratuit, pour l’instant.',
          },
        ],
      },
      {
        banker:
          'Je vous précise que le taux est fixé par l’État, pas par moi. Je ne suis responsable de rien, c’est ma spécialité.',
        replies: [
          {
            label: 'Ça me rassure.',
            reaction: 'Vous avez l’étoffe d’un client fidèle.',
          },
          {
            label: 'Et le taux, il est de combien ?',
            reaction:
              'Suffisant pour que ce soit écrit en gros sur la plaquette.',
          },
        ],
      },
    ],
    farewell: 'Merci.',
  },
  ldds: {
    steps: [
      {
        banker:
          'Le Livret de développement durable et solidaire. Le nom est long, le plafond court : c’est l’équilibre de la maison.',
        replies: [
          {
            label: 'Il développe quoi, au juste ?',
            reaction:
              'Excellente question, que personne n’a posée avant vous, jamais.',
          },
          {
            label: 'Je suis très solidaire.',
            reaction: 'Je note : « sensible à la cause ». Ça se vend bien.',
          },
        ],
      },
      {
        banker:
          'Une partie de vos fonds finance des projets verts. Je ne peux pas vous dire lesquels, mais ils sont très verts.',
        replies: [
          {
            label: 'Une éolienne, peut-être ?',
            reaction: 'Il y a eu une éolienne. En photo, sur la brochure.',
          },
          {
            label: 'Je préfère ne pas savoir.',
            reaction:
              'Voilà qui fait de vous un épargnant exemplaire. Rien ne vous ralentira.',
          },
        ],
      },
      {
        banker:
          'Un dernier point : vous avez déjà un Livret A ? Deux livrets, c’est une vie bien rangée.',
        replies: [
          {
            label: 'Oui, et je m’en félicite.',
            reaction: 'Deux livrets : vous voilà quasiment un investisseur.',
          },
          {
            label: 'Je suis venu pour la plaquette.',
            reaction:
              'Prenez-en deux. Elles sont recyclées, et vous, vous êtes durable.',
          },
        ],
      },
    ],
    farewell: 'Merci, au revoir.',
  },
  pel: {
    steps: [
      {
        banker:
          'Le Plan d’épargne logement. Vous avez un projet immobilier ? Ou juste un projet de projet ?',
        replies: [
          {
            label: 'Un vrai projet, d’ici dix ans.',
            reaction: 'Dix ans ! Vous êtes pressé, j’aime ça.',
          },
          {
            label: 'Un projet de projet.',
            reaction:
              'La catégorie la plus répandue. Nous avons un guichet dédié.',
          },
        ],
      },
      {
        banker:
          'L’argent est bloqué quatre ans minimum. Techniquement vous pouvez le reprendre, techniquement.',
        replies: [
          {
            label: 'Quatre ans, ça va.',
            reaction:
              'Courage. Les plus pressés ferment le compte, et nous gardons le dossier.',
          },
          {
            label: 'Et si j’ai besoin de cet argent ?',
            reaction:
              'Alors vous découvrirez notre service « réclamations », très humain, à ce qu’on dit.',
          },
        ],
      },
      {
        banker:
          'Avec ce taux garanti, votre épargne aura fait quasiment la moitié du chemin vers l’inflation.',
        replies: [
          {
            label: 'La moitié, c’est déjà ça.',
            reaction: 'Un optimiste ! Je vais faire encadrer ça.',
          },
          {
            label: 'Je prends le stylo.',
            reaction:
              'Beau réflexe. Signez avant que la loi, ou le taux, change.',
          },
        ],
      },
      {
        banker:
          'Mon directeur vous propose aussi une assurance emprunteur, par pur hasard. Elle est facultative, au sens où nous l’exigeons.',
        replies: [
          {
            label: 'Je vais y réfléchir.',
            reaction:
              'Bien sûr. Vous avez jusqu’à la fin de cette phrase pour réfléchir.',
          },
          {
            label: 'Je la prends aussi.',
            reaction:
              'Formidable. Vous venez de financer le café du directeur.',
          },
        ],
      },
    ],
    farewell: 'À bientôt, peut-être.',
  },
  stocks: {
    steps: [
      {
        banker:
          'Un compte-titres ! Enfin quelqu’un qui a compris que l’argent peut travailler. Le vôtre, pas le mien : moi, je suis payé à la commission.',
        replies: [
          {
            label: 'Je veux faire fructifier mon capital.',
            reaction: 'Vous parlez comme un prospectus, ça me touche.',
          },
          {
            label: 'Mon beau-frère m’a conseillé.',
            reaction:
              'Les beaux-frères. Notre meilleure force commerciale, sans salaire.',
          },
        ],
      },
      {
        banker:
          'Je dois vous remettre le document « Profil de risque ». Pouvez-vous cocher la case qui vous représente le mieux ?',
        replies: [
          {
            label: 'Prudent.',
            reaction:
              'Prudent. Je coche « dynamique », la case suivante n’était pas imprimée.',
          },
          {
            label: 'Audacieux.',
            reaction:
              'Audacieux ! Enfin quelqu’un qui ne lit pas les contrats.',
          },
        ],
      },
      {
        banker:
          'Les performances passées ne préjugent pas des performances futures. Je suis tenu de le dire, et je le dis à toute vitesse.',
        replies: [
          {
            label: 'Les futures seront bonnes ?',
            reaction:
              'Les performances passées ne préjugent pas… vous m’avez compris.',
          },
          {
            label: 'Parfait, je n’écoutais pas.',
            reaction:
              'Le client idéal : ce que vous ne lisez pas ne coûte rien.',
          },
        ],
      },
      {
        banker:
          'Je peux vous proposer notre fonds maison. Frais d’entrée, frais de gestion, frais de sortie : tout est transparent, au sens où il y a des chiffres.',
        replies: [
          {
            label: 'Quels frais, exactement ?',
            reaction:
              'Les frais. Tous. Je vous les envoie par courrier, en police 6.',
          },
          {
            label: 'Je prends le fonds maison.',
            reaction: 'Sage décision, pour ma prime de fin de trimestre.',
          },
        ],
      },
      {
        banker:
          'En cas de krach, nos équipes vous contacteront immédiatement. Pour vous rassurer, ou pour vous demander de racheter.',
        replies: [
          {
            label: 'Je vendrai au pire moment.',
            reaction:
              'C’est exactement le comportement que nos algorithmes ont anticipé.',
          },
          {
            label: 'Je tiendrai bon, je suis patient.',
            reaction:
              'Patient ! La qualité préférée des banquiers, à égalité avec l’endormissement.',
          },
        ],
      },
    ],
    farewell: 'Que la bourse soit avec moi.',
  },
};

export const appointmentScript = (id: PlacementId): BankerScript => scripts[id];
