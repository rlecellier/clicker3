import { describe, expect, it } from 'vitest';
import { childActivities, childObjects, childRules } from '@game/data';
import { newGame, reduce } from '@game/reducer';
import { sliceTabs } from '@game/lifeSlices';
import { simulatorConfig } from '@game/simulator/config';
import type { GameState } from '@game/state';
import {
  availableActivities,
  axisReading,
  babble,
  childAge,
  doActivity,
  giveObject,
  isChildhoodOver,
  removeObject,
} from './earlyChildhood';

const baby = () => newGame(undefined, 'earlyChildhood');

const babbleTimes = (state: GameState, times: number) => {
  let next = state;
  for (let index = 0; index < times; index += 1) {
    next = babble(next);
  }
  return next;
};

describe('petite enfance : le bouton de départ', () => {
  it('commence à la naissance, sans objet et sans caractère', () => {
    const state = baby();
    expect(state.child).toEqual({
      axes: { energy: 0, sociability: 0, mind: 0, bond: 0 },
      objects: [],
      quarter: 0,
      fill: 0,
    });
    expect(childAge(state)).toEqual({ years: 0, months: 0 });
  });

  it('fait monter l’éveil et remplit la jauge du trimestre', () => {
    const state = babbleTimes(baby(), 3);
    expect(state.growth).toBe(3);
    expect(state.child.fill).toBe(3);
    expect(state.child.quarter).toBe(0);
  });

  it('passe un trimestre quand la jauge est pleine', () => {
    const state = babbleTimes(baby(), childRules.quarterCapacity);
    expect(state.child.quarter).toBe(1);
    expect(state.child.fill).toBe(0);
    expect(childAge(state)).toEqual({ years: 0, months: 3 });
  });

  it('suit la même action que le bouton du reducer', () => {
    expect(reduce(baby(), { type: 'grow' }).growth).toBe(1);
  });

  it('s’arrête à 6 ans : plus rien ne joue', () => {
    const done = babbleTimes(
      baby(),
      childRules.quarters * childRules.quarterCapacity,
    );
    expect(isChildhoodOver(done)).toBe(true);
    expect(childAge(done)).toEqual({ years: 6, months: 0 });
    expect(babble(done)).toBe(done);
    expect(doActivity(giveObject(done, 'teddy'), 'cuddleTeddy').child).toEqual(
      giveObject(done, 'teddy').child,
    );
  });

  it('ne joue pas hors de la petite enfance', () => {
    const state = newGame(undefined, 'childhood');
    expect(babble(state)).toBe(state);
  });
});

describe('petite enfance : les objets', () => {
  it('arrivent à mesure que l’éveil monte, chacun une fois', () => {
    const giftAt = childObjects.find(({ id }) => id === 'teddy')?.giftAt ?? 0;
    expect(giftAt).toBeGreaterThan(0);
    expect(babbleTimes(baby(), giftAt - 1).child.objects).toEqual([]);
    const gifted = babbleTimes(baby(), giftAt);
    expect(gifted.child.objects).toEqual(['teddy']);
    expect(giveObject(gifted, 'teddy')).toBe(gifted);
  });

  it('s’ajoutent et se retirent, un inconnu est ignoré', () => {
    const state = giveObject(baby(), 'ball');
    expect(state.child.objects).toEqual(['ball']);
    expect(giveObject(state, 'fantome')).toBe(state);
    expect(removeObject(state, 'ball').child.objects).toEqual([]);
    expect(removeObject(state, 'cat')).toBe(state);
  });

  it('ouvrent la Maison au premier objet', () => {
    const withTeddy = giveObject(baby(), 'teddy');
    expect(sliceTabs(baby())).toEqual(['life']);
    expect(sliceTabs(withTeddy)).toEqual(['life', 'house']);
    expect(sliceTabs(removeObject(withTeddy, 'teddy'))).toEqual(['life']);
  });
});

describe('petite enfance : les activités', () => {
  it('viennent d’un objet possédé', () => {
    expect(availableActivities(baby())).toEqual([]);
    const ids = availableActivities(giveObject(baby(), 'teddy')).map(
      ({ id }) => id,
    );
    expect(ids).toEqual(['cuddleTeddy', 'teachTeddy']);
  });

  it('poussent un axe vers un pôle, sans hasard, et avancent le temps', () => {
    const state = doActivity(giveObject(baby(), 'teddy'), 'cuddleTeddy');
    expect(state.child.axes.bond).toBe(2);
    expect(state.child.fill).toBe(1);
    expect(state.growth).toBe(1);
    const other = doActivity(giveObject(baby(), 'spoon'), 'eatAlone');
    expect(other.child.axes.bond).toBe(-2);
  });

  it('refusent une activité qu’on n’a pas', () => {
    const state = baby();
    expect(doActivity(state, 'cuddleTeddy')).toBe(state);
    expect(doActivity(state, 'inconnue')).toBe(state);
  });

  it('gardent un axe entre −100 et +100', () => {
    let state = giveObject(baby(), 'teddy');
    for (let index = 0; index < 80; index += 1) {
      state = doActivity(state, 'cuddleTeddy');
    }
    expect(state.child.axes.bond).toBe(childRules.axisLimit);
  });

  it('débloquent un savoir-faire quand l’axe est assez marqué du bon côté', () => {
    let state = giveObject(baby(), 'teddy');
    expect(availableActivities(state).map(({ id }) => id)).not.toContain(
      'console',
    );
    const pushes = Math.ceil(childRules.axisThreshold / 2);
    for (let index = 0; index < pushes; index += 1) {
      state = doActivity(state, 'cuddleTeddy');
    }
    const ids = availableActivities(state).map(({ id }) => id);
    expect(ids).toContain('console');
    // Le pôle opposé reste fermé.
    expect(ids).not.toContain('dressAlone');
  });

  it('referment un savoir-faire quand l’axe repasse sous le seuil', () => {
    let state = giveObject(giveObject(baby(), 'teddy'), 'spoon');
    for (let index = 0; index < 13; index += 1) {
      state = doActivity(state, 'cuddleTeddy');
    }
    expect(availableActivities(state).map(({ id }) => id)).toContain('console');
    for (let index = 0; index < 30; index += 1) {
      state = doActivity(state, 'eatAlone');
    }
    const ids = availableActivities(state).map(({ id }) => id);
    expect(ids).not.toContain('console');
    expect(ids).toContain('dressAlone');
  });

  it('se rejouent par le reducer', () => {
    const state = reduce(giveObject(baby(), 'ball'), {
      type: 'doActivity',
      id: 'chaseBall',
    });
    expect(state.child.axes.energy).toBe(2);
  });
});

describe('petite enfance : lecture d’un axe', () => {
  const axis = {
    id: 'energy',
    name: 'Énergie',
    positive: 'Vif',
    negative: 'Posé',
  } as const;

  it('nomme le pôle et la distance à zéro', () => {
    expect(axisReading(axis, 34)).toEqual({ pole: 'Vif', amount: 34 });
    expect(axisReading(axis, -12)).toEqual({ pole: 'Posé', amount: 12 });
    expect(axisReading(axis, 0)).toEqual({ pole: 'Neutre', amount: 0 });
  });
});

describe('petite enfance : les données', () => {
  it('relient chaque activité à un objet connu', () => {
    const objectIds = new Set(childObjects.map(({ id }) => id));
    for (const activity of childActivities) {
      if (activity.source.type === 'object') {
        expect(objectIds.has(activity.source.id), activity.id).toBe(true);
      }
    }
    expect(new Set(childActivities.map(({ id }) => id)).size).toBe(
      childActivities.length,
    );
  });

  it('offrent les deux pôles de chaque axe', () => {
    for (const axis of ['energy', 'sociability', 'mind', 'bond']) {
      for (const direction of [1, -1]) {
        const fromObject = childActivities.some(
          (activity) =>
            activity.axis === axis &&
            activity.direction === direction &&
            activity.source.type === 'object',
        );
        expect(fromObject, `${axis} ${direction}`).toBe(true);
      }
    }
  });

  it('donnent un seul objet par palier d’éveil', () => {
    const steps = childObjects.map(({ giftAt }) => giftAt);
    expect(new Set(steps).size).toBe(steps.length);
  });
});

describe('petite enfance : un joueur virtuel', () => {
  // Il gazouille, puis joue tour à tour ses activités à portée : la tranche
  // finit, rien ne le bloque, et sa durée reste dans la cible (une action par
  // seconde, comme le simulateur de vie).
  it('joue la tranche jusqu’aux 6 ans sans rester bloqué', () => {
    let state = baby();
    let actions = 0;
    while (!isChildhoodOver(state) && actions < 1000) {
      const options = availableActivities(state);
      const activity = options[actions % Math.max(options.length, 1)];
      state =
        activity === undefined ? babble(state) : doActivity(state, activity.id);
      actions += 1;
    }
    expect(isChildhoodOver(state)).toBe(true);
    expect(actions).toBe(childRules.quarters * childRules.quarterCapacity);
    const minutes = (actions * simulatorConfig.humanCadenceMs) / 60_000;
    expect(minutes).toBeGreaterThanOrEqual(3);
    expect(minutes).toBeLessThanOrEqual(8);
    expect(state.child.objects).toHaveLength(childObjects.length);
    expect(Object.values(state.child.axes).every((value) => value !== 0)).toBe(
      true,
    );
  });
});
