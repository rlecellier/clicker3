/** Gèle un objet en profondeur : toute mutation lève une erreur (mode strict). */
export const deepFreeze = <T extends object>(value: T): T => {
  for (const child of Object.values(value)) {
    if (typeof child === 'object' && child !== null) {
      deepFreeze(child);
    }
  }
  return Object.freeze(value);
};
