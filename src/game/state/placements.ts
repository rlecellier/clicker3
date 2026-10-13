// Les placements, par rendement croissant : c'est l'ordre de remplissage (le
// surplus va au premier qui a de la place) et de reprise (on puise d'abord dans
// le moins rémunérateur). `money` est le total de tous les comptes ; ce qui
// n'est pas placé est sur le compte courant, qui ne rend rien.
export const placementIds = ['savings', 'ldds', 'pel', 'stocks'] as const;
