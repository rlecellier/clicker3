// Une réplique du banquier et les réponses que le joueur peut donner (toutes
// mènent à la suite : on ne gagne pas contre un banquier).
export type BankerStep = {
  banker: string;
  replies: readonly string[];
};

// Le rendez-vous, en cinq temps. La dernière réponse est le « merci » qui
// ouvre le compte.
export const appointmentScript = (
  accountName: string,
): readonly BankerStep[] => [
  {
    banker:
      'Asseyez-vous, je vous en prie. Vous avez bien un rendez-vous ? Non ? Parfait, ça nous fera gagner du temps.',
    replies: ['Je voudrais ouvrir un compte.', 'Je suis en avance.'],
  },
  {
    banker: `Un ${accountName}. Excellent choix, c’est ce que je dis à tout le monde. Votre situation évolue ? Votre situation évolue toujours.`,
    replies: ['Plutôt à la hausse.', 'Cela dépend de qui demande.'],
  },
  {
    banker:
      'Je dois vous poser quelques questions obligatoires. Avez-vous déjà eu des difficultés ? Vous pouvez répondre non, c’est la réponse que je coche.',
    replies: ['Non.', 'Seulement avec vous.'],
  },
  {
    banker:
      'Mon collègue, qui n’existe pas, a validé votre dossier. Il me demande de vous rappeler que votre argent est « en sécurité », au sens où nous seuls y avons accès.',
    replies: ['C’est rassurant.', 'Je prends le stylo.'],
  },
  {
    banker:
      'Signez ici, ici, ici, puis là, là, et encore ici. Les frais de dossier sont offerts, ils reviendront sous un autre nom. Voilà, c’est fait. Un dernier mot ?',
    replies: ['Merci.'],
  },
];
