import { giveObject } from '@game/earlyChildhood';
import { newGame } from '@game/reducer';
import { houseEntries, houseLayout } from './houseEntries';

const baby = () => newGame(undefined, 'earlyChildhood');

describe('houseLayout', () => {
  it('range les activités par axe, le pôle négatif à gauche et le positif à droite', () => {
    const state = giveObject(giveObject(baby(), 'teddy'), 'cubes');
    const { axes, others } = houseLayout(houseEntries(state));
    const temperament = axes.find(({ axisId }) => axisId === 'temperament');
    expect(temperament?.negativePole).toBe('Raison');
    expect(temperament?.positivePole).toBe('Sentiment');
    expect(temperament?.negative.map(({ id }) => id)).toEqual(['sortCubes']);
    expect(temperament?.positive.map(({ id }) => id)).toEqual(['cuddleTeddy']);
    const energy = axes.find(({ axisId }) => axisId === 'energy');
    expect(energy?.positive.map(({ id }) => id)).toEqual(['teachTeddy']);
    expect(energy?.negative).toEqual([]);
    // Rien ne pousse la Sociabilité : pas de section vide.
    expect(axes.map(({ axisId }) => axisId)).not.toContain('sociability');
    expect(others).toEqual([]);
  });

  it('garde les axes dans l’ordre du caractère', () => {
    const state = giveObject(giveObject(baby(), 'teddy'), 'rattle');
    const ids = houseLayout(houseEntries(state)).axes.map(
      ({ axisId }) => axisId,
    );
    expect(ids).toEqual(['energy', 'sociability', 'temperament']);
  });

  it('met Sortir et Demander à part, sous les axes', () => {
    const state = baby();
    const grown = {
      ...state,
      child: { ...state.child, quarter: 20, attention: 100 },
    };
    const { others } = houseLayout(houseEntries(grown));
    expect(others.map(({ caption }) => caption)).toEqual([
      'Sortir',
      'Demander',
    ]);
  });
});
