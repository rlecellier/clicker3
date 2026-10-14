// Hasard déterministe (mulberry32) : un état donne toujours le même tirage.
// Rend un nombre de [0, 1[ et la graine suivante.
export const nextRandom = (seed: number): [value: number, seed: number] => {
  const next = (seed + 1_831_565_813) >>> 0;
  let mixed = Math.imul(next ^ (next >>> 15), 1 | next);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
  return [((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296, next];
};
