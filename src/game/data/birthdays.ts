// Âges symboliques : à chacun, une fenêtre fait le point sur les années écoulées
// depuis le précédent anniversaire (voir @game/birthday).
export type Birthday = {
  age: number;
  title: string;
  message: string;
};

export const birthdays: readonly Birthday[] = [
  {
    age: 18,
    title: 'Joyeux 18e anniversaire !',
    message:
      'Félicitations : vous êtes majeur, autonome et libre de signer n’importe quel contrat sans le lire. Le monde adulte vous attend, avec ses charges et ses mensualités.',
  },
  {
    age: 20,
    title: '20 ans déjà !',
    message:
      'On a fêté vos 18 ans il y a un instant, mais 20, c’est un chiffre rond. Une raison de plus de lever un verre, de préférence avec modération et un budget.',
  },
  {
    age: 25,
    title: 'Le quart de siècle !',
    message:
      'Vingt-cinq ans : un quart de siècle, incroyable. Statistiquement, vous avez déjà vécu un tiers de votre vie. Il est temps de s’y mettre.',
  },
  {
    age: 30,
    title: '30 ans !',
    message:
      'Certains y voient le début de la vieillesse, d’autres le début de la jeunesse. Votre dos a son avis, mais personne ne le lui a demandé.',
  },
  {
    age: 40,
    title: '40 ans !',
    message:
      'Ça fait longtemps qu’on n’a pas fait la fête, non ? Certains disent que la vie commence à 40 ans. Profitez-en pour vous réveiller avec une courbature de plus.',
  },
  {
    age: 50,
    title: '50 ans !',
    message:
      'Un demi-siècle. D’autres disent que c’est à 50 ans que la vie commence vraiment : ils ne se sont visiblement pas concertés avec ceux de 40.',
  },
  {
    age: 60,
    title: '60 ans !',
    message:
      'La retraite approche, enfin presque. On ne sait pas trop quand, ni avec quelle pension, mais on a de très bonnes brochures.',
  },
  {
    age: 70,
    title: '70 ans !',
    message:
      'Enfin la retraite ! Vous allez pouvoir vous consacrer à ce qui vous plaît, dès que vous aurez fini vos rendez-vous médicaux.',
  },
  {
    age: 75,
    title: '75 ans… bravo !',
    message:
      'Bravo, vous êtes mort. Vous avez tenu jusqu’au bout, ce qui est déjà pas mal. Voici ce qu’il reste de votre belle carrière.',
  },
];
