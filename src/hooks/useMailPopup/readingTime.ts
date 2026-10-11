export const BASE_READING_MS = 4000;
export const READING_MS_PER_CHARACTER = 60;
export const MAX_READING_MS = 15_000;

// Durée d'affichage de la popup de courrier : 4 s, plus 60 ms par caractère,
// sans dépasser 15 s. C'est un délai d'interface, pas du temps de jeu.
export const readingTime = (text: string) =>
  Math.min(
    BASE_READING_MS + text.length * READING_MS_PER_CHARACTER,
    MAX_READING_MS,
  );
