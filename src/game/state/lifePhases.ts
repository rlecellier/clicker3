// Ordre des phases de vie liées à la progression (docs/game/v1.md § 4).
// La vieillesse n'en fait pas partie : elle se déduit de l'âge (`isSenior`)
// et se cumule avec la phase atteinte.
export const lifePhases = ['youngAdult', 'entrepreneur', 'boss'] as const;
