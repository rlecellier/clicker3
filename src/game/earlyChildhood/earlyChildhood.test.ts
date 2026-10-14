import { describe, expect, it } from 'vitest';
import {
  birthSituations,
  childActivities,
  childEvents,
  childObjects,
  childPlaces,
  childRules,
  childTraits,
  childWishes,
  findById,
  startState,
} from '@game/data';
import { newGame, reduce } from '@game/reducer';
import { sliceTabs } from '@game/lifeSlices';
import { simulatorConfig } from '@game/simulator/config';
import type { GameState } from '@game/state';
import {
  addTrait,
  askFor,
  availableActivities,
  canEnterChildhood,
  childCarry,
  childEventText,
  enterChildhood,
  axisReading,
  babble,
  canAsk,
  childAge,
  chooseEvent,
  describeEffect,
  doActivity,
  eligibleEvents,
  explore,
  giveObject,
  isChildhoodOver,
  nextRandom,
  removeObject,
  wishAnswer,
} from '.';

const baby = (seed?: number) =>
  newGame(undefined, 'earlyChildhood', undefined, seed);

// Répond au premier choix de chaque événement ouvert : ces tests ne
// s'intéressent qu'aux gestes.
const settle = (state: GameState): GameState =>
  state.child.pendingEvent === null ? state : chooseEvent(state, 0);

const babbleTimes = (state: GameState, times: number) => {
  let next = state;
  for (let index = 0; index < times; index += 1) {
    next = settle(babble(next));
  }
  return next;
};

// Joue la tranche à un geste par trimestre jusqu'au trimestre voulu.
const untilQuarter = (state: GameState, quarter: number) => {
  let next = state;
  while (next.child.quarter < quarter) {
    next = settle(babble(next));
  }
  return next;
};

const required = <Item>(value: Item | undefined): Item => {
  if (value === undefined) {
    throw new Error('Élément de test manquant');
  }
  return value;
};

// L'enfant à un trimestre donné, sans avoir joué les précédents.
const atQuarter = (quarter: number, seed?: number): GameState => {
  const state = baby(seed);
  return { ...state, child: { ...state.child, quarter } };
};

// Famille standard : moyens 50.
const asker = (): GameState => atQuarter(16);

const wishAt = (id: string) => required(findById(childWishes, id));

// Les objets obtenus en fouillant la maison cinq fois, pour une graine.
const homeFinds = (seed: number) => {
  let state = atQuarter(12, seed);
  for (let step = 0; step < 5; step += 1) {
    state = explore(state, 'home');
  }
  return state.child.objects;
};

const grown = () => untilQuarter(baby(4), childRules.quarters);

const eventsOf = (seed: number) =>
  untilQuarter(baby(seed), childRules.quarters).child.firedEvents;

describe('petite enfance : le bouton de départ', () => {
  it('commence à la naissance, sans objet et sans caractère', () => {
    const state = baby();
    expect(state.child).toEqual(startState.child);
    expect(state.child.objects).toEqual([]);
    expect(state.child.traits).toEqual([]);
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
    const done = untilQuarter(baby(), childRules.quarters);
    expect(isChildhoodOver(done)).toBe(true);
    expect(childAge(done)).toEqual({ years: 6, months: 0 });
    expect(babble(done)).toBe(done);
    const withTeddy = giveObject(done, 'teddy');
    expect(doActivity(withTeddy, 'cuddleTeddy')).toBe(withTeddy);
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
    expect(sliceTabs(baby())).toEqual(['life', 'relations']);
    expect(sliceTabs(withTeddy)).toEqual(['life', 'house', 'relations']);
    expect(sliceTabs(removeObject(withTeddy, 'teddy'))).toEqual([
      'life',
      'relations',
    ]);
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
      state = settle(doActivity(state, 'cuddleTeddy'));
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
      state = settle(doActivity(state, 'cuddleTeddy'));
    }
    expect(availableActivities(state).map(({ id }) => id)).toContain('console');
    for (let index = 0; index < 30; index += 1) {
      state = settle(doActivity(state, 'eatAlone'));
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

describe('petite enfance : le hasard', () => {
  it('est déterministe et reste dans [0, 1[', () => {
    expect(nextRandom(42)).toEqual(nextRandom(42));
    let seed = 7;
    for (let index = 0; index < 200; index += 1) {
      const [value, next] = nextRandom(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      seed = next;
    }
  });
});

describe('petite enfance : les événements', () => {
  it('ouvrent le premier mot à 1 an, sans tirage', () => {
    const state = untilQuarter(baby(), 3);
    expect(state.child.pendingEvent).toBeNull();
    const opened = babbleTimes(state, childRules.quarterCapacity);
    // `settle` répond tout de suite : le premier mot est donc déjà vécu.
    expect(opened.child.firedEvents[0]).toBe('firstWord');
  });

  it('arrêtent le jeu tant qu’on n’a pas répondu', () => {
    let state = baby();
    for (let index = 0; index < childRules.quarterCapacity * 4; index += 1) {
      state = babble(state);
    }
    expect(state.child.pendingEvent).toBe('firstWord');
    expect(babble(state)).toBe(state);
    expect(reduce(state, { type: 'grow' })).toBe(state);
  });

  it('appliquent les effets du choix, puis reprennent', () => {
    let state = baby();
    for (let index = 0; index < childRules.quarterCapacity * 4; index += 1) {
      state = babble(state);
    }
    const answered = reduce(state, { type: 'chooseEvent', choice: 2 });
    expect(answered.child.pendingEvent).toBeNull();
    expect(answered.child.firedEvents).toEqual(['firstWord']);
    expect(answered.child.traits).toEqual(['stubborn']);
    expect(answered.child.axes.mind).toBe(3);
    expect(babble(answered).growth).toBe(answered.growth + 1);
    // Un choix inconnu ne change rien.
    expect(chooseEvent(state, 9)).toBe(state);
    expect(chooseEvent(baby(), 0).child.firedEvents).toEqual([]);
  });

  it('choisissent selon les conditions : un caractère Vif ouvre l’escalier', () => {
    const calm = atQuarter(5);
    expect(eligibleEvents(calm).map(({ id }) => id)).not.toContain('stairs');
    const lively = {
      ...calm,
      child: { ...calm.child, axes: { ...calm.child.axes, energy: 30 } },
    };
    expect(eligibleEvents(lively).map(({ id }) => id)).toContain('stairs');
    const posed = {
      ...calm,
      child: { ...calm.child, axes: { ...calm.child.axes, energy: -30 } },
    };
    expect(eligibleEvents(posed).map(({ id }) => id)).not.toContain('stairs');
  });

  it('exigent un objet, un trait ou un événement quand la condition le dit', () => {
    const base = atQuarter(7);
    const bonded = {
      ...base,
      child: { ...base.child, axes: { ...base.child.axes, bond: 30 } },
    };
    expect(eligibleEvents(bonded).map(({ id }) => id)).not.toContain(
      'lostTeddy',
    );
    expect(
      eligibleEvents(giveObject(bonded, 'teddy')).map(({ id }) => id),
    ).toContain('lostTeddy');
  });

  it('ne rejouent jamais un événement', () => {
    const state = untilQuarter(baby(), childRules.quarters);
    const ids = state.child.firedEvents;
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('en jouent entre le minimum et le maximum, quelle que soit la graine', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const done = untilQuarter(baby(seed), childRules.quarters);
      const count = done.child.firedEvents.length;
      expect(count, `graine ${seed}`).toBeGreaterThanOrEqual(
        childRules.events.min,
      );
      expect(count, `graine ${seed}`).toBeLessThanOrEqual(
        childRules.events.max,
      );
    }
  });

  it('les espacent d’au moins le délai voulu', () => {
    const history: number[] = [];
    let state = baby(3);
    while (state.child.quarter < childRules.quarters) {
      const opened = babble(state);
      if (
        opened.child.pendingEvent !== null &&
        state.child.pendingEvent === null
      ) {
        history.push(opened.child.quarter);
      }
      state = settle(opened);
    }
    // Le premier mot est obligatoire et ne compte pas dans l'espacement.
    const drawn = history.slice(1);
    for (let index = 1; index < drawn.length; index += 1) {
      expect(
        required(drawn[index]) - required(drawn[index - 1]),
      ).toBeGreaterThanOrEqual(childRules.events.spacing);
    }
  });

  it('rejouent la même vie avec la même graine, une autre avec une autre', () => {
    expect(eventsOf(5)).toEqual(eventsOf(5));
    const all = new Set(
      Array.from({ length: 25 }, (_, index) => eventsOf(index + 1).join(',')),
    );
    expect(all.size).toBeGreaterThan(5);
  });

  it('limitent les traits à trois', () => {
    let state = baby();
    for (const { id } of childTraits.slice(0, 5)) {
      state = addTrait(state, id);
    }
    expect(state.child.traits).toHaveLength(childRules.traitLimit);
    expect(addTrait(state, 'inconnu')).toBe(state);
    const [first] = state.child.traits;
    expect(addTrait(state, required(first))).toBe(state);
  });

  it('décrivent chaque effet en une ligne', () => {
    expect(
      describeEffect(baby(), { type: 'axis', axis: 'energy', amount: 6 }),
    ).toBe('Énergie → Vif');
    expect(
      describeEffect(baby(), { type: 'axis', axis: 'mind', amount: -3 }),
    ).toBe('Esprit → Appliqué');
    expect(describeEffect(baby(), { type: 'trait', id: 'stubborn' })).toBe(
      'Trait : Têtu',
    );
    expect(describeEffect(baby(), { type: 'giveObject', id: 'cat' })).toBe(
      'Reçoit : Le chat',
    );
    expect(describeEffect(baby(), { type: 'removeObject', id: 'teddy' })).toBe(
      'Perd : Nounours',
    );
  });
});

describe('petite enfance : l’exploration', () => {
  it('s’ouvre à 3 ans pour la maison et à 4 ans pour le dehors', () => {
    expect(explore(atQuarter(11), 'home')).toEqual(atQuarter(11));
    expect(explore(atQuarter(12), 'home').child.search.home).toBe(1);
    expect(explore(atQuarter(15), 'outside').child.search.outside).toBe(0);
    expect(explore(atQuarter(16), 'outside').child.search.outside).toBe(1);
  });

  it('rend un objet du lieu toutes les cinq fouilles, jamais deux fois le même', () => {
    const place = required(childPlaces.find(({ id }) => id === 'home'));
    let state = atQuarter(12);
    for (let found = 1; found <= place.finds.length; found += 1) {
      for (let step = 0; step < place.steps; step += 1) {
        state = settle(explore(state, 'home'));
      }
      const owned = state.child.objects.filter((id) =>
        place.finds.includes(id),
      );
      expect(owned).toHaveLength(found);
      expect(state.child.search.home).toBe(0);
    }
    // Plus rien à trouver : la fouille ne joue plus.
    expect(explore(state, 'home')).toBe(state);
  });

  it('avance le temps comme un geste', () => {
    const state = explore(atQuarter(12), 'home');
    expect(state.growth).toBe(1);
    expect(state.child.fill).toBe(1);
  });

  it('est rejouable à l’identique avec la même graine', () => {
    expect(homeFinds(9)).toEqual(homeFinds(9));
    expect(
      new Set(
        Array.from({ length: 12 }, (_, seed) => homeFinds(seed).join(',')),
      ).size,
    ).toBeGreaterThan(1);
  });

  it('se rejoue par le reducer', () => {
    const state = reduce(atQuarter(12), { type: 'explore', place: 'home' });
    expect(state.child.search.home).toBe(1);
  });
});

describe('petite enfance : réclamer un objet', () => {
  it('dépend des moyens de la famille, sans hasard', () => {
    const state = asker();
    expect(wishAnswer(state, wishAt('logicGame'))).toBe('yes');
    expect(wishAnswer(state, wishAt('costume'))).toBe('later');
    expect(wishAnswer(state, wishAt('bike'))).toBe('no');
  });

  it('s’ouvre à 4 ans et coûte de l’Attention', () => {
    const young = baby();
    expect(canAsk(young, wishAt('logicGame'))).toBe(false);
    const state = asker();
    expect(canAsk(state, wishAt('logicGame'))).toBe(true);
    const asked = askFor(state, 'logicGame');
    expect(asked.child.attention).toBe(
      state.child.attention - childRules.askCost,
    );
    expect(asked.child.objects).toContain('logicGame');
    expect(asked.child.fill).toBe(1);
  });

  it('refuse sans Attention, ou quand l’objet est déjà là', () => {
    const state = asker();
    const tired = { ...state, child: { ...state.child, attention: 10 } };
    expect(askFor(tired, 'logicGame')).toBe(tired);
    const owned = askFor(state, 'logicGame');
    expect(canAsk(owned, wishAt('logicGame'))).toBe(false);
    expect(askFor(state, 'inconnu')).toBe(state);
  });

  it('livre un « plus tard » après le délai, sans le redemander', () => {
    let state = askFor(asker(), 'costume');
    expect(state.child.objects).not.toContain('costume');
    expect(state.child.later).toHaveLength(1);
    expect(canAsk(state, wishAt('costume'))).toBe(false);
    state = untilQuarter(state, 16 + childRules.laterDelay);
    expect(state.child.objects).toContain('costume');
    expect(state.child.later).toEqual([]);
  });

  it('dit non sans rien livrer, et rend de l’Attention avec le temps', () => {
    const asked = askFor(asker(), 'bike');
    expect(asked.child.objects).not.toContain('bike');
    expect(asked.child.later).toEqual([]);
    const later = untilQuarter(asked, 20);
    expect(later.child.attention).toBeGreaterThan(asked.child.attention);
    expect(later.child.attention).toBeLessThanOrEqual(childRules.attentionMax);
  });

  it('se joue par le reducer', () => {
    const state = reduce(asker(), {
      type: 'askFor',
      wishId: 'logicGame',
    });
    expect(state.child.objects).toContain('logicGame');
  });
});

describe('petite enfance : le bilan et le passage en Enfance', () => {
  it('n’est possible qu’aux 6 ans', () => {
    expect(canEnterChildhood(baby())).toBe(false);
    expect(enterChildhood(baby())).toEqual(baby());
    expect(canEnterChildhood(grown())).toBe(true);
    expect(canEnterChildhood(newGame(undefined, 'childhood'))).toBe(false);
  });

  it('transmet le caractère, les traits, les objets et les événements', () => {
    const done = grown();
    const carry = childCarry(done);
    expect(carry.axes).toEqual(done.child.axes);
    expect(carry.traits).toEqual(done.child.traits);
    expect(carry.objects).toEqual(done.child.objects);
    expect(carry.events).toBe(done.child.firedEvents.length);
    expect(carry.events).toBeGreaterThanOrEqual(childRules.events.min);
  });

  it('démarre l’Enfance avec ce qui a été transmis, sans rien d’autre', () => {
    const done = grown();
    const next = enterChildhood(done);
    expect(next.lifeSlice).toBe('childhood');
    expect(next.carry).toEqual(childCarry(done));
    expect(next.relations).toEqual(done.relations);
    expect(next.birthSituation).toBe(done.birthSituation);
    expect(next.growth).toBe(0);
    expect(next.child).toEqual({ ...startState.child, seed: done.child.seed });
    expect(next.status).toBe('playing');
  });

  it('se joue par le reducer, et l’Enfance garde l’héritage', () => {
    const next = reduce(grown(), { type: 'enterChildhood' });
    expect(next.lifeSlice).toBe('childhood');
    const played = reduce(next, { type: 'grow' });
    expect(played.growth).toBe(1);
    expect(played.carry).toEqual(next.carry);
    // Pas de bilan avant l'heure.
    expect(reduce(baby(), { type: 'enterChildhood' })).toEqual(baby());
  });

  it('s’efface quand on recommence une vie', () => {
    const next = reduce(grown(), { type: 'enterChildhood' });
    expect(reduce(next, { type: 'restart' }).carry).toBeNull();
  });
});

const playedBy = (situation: string, seed: number) =>
  untilQuarter(
    newGame(undefined, 'earlyChildhood', situation, seed),
    childRules.quarters,
  );

const firstBond = (state: GameState) => state.relations[0]?.bond ?? 0;

// Tous les événements vécus dans une situation, sur trente graines.
const livedIn = (situation: string) =>
  new Set(
    Array.from(
      { length: 30 },
      (_, seed) => playedBy(situation, seed + 1).child.firedEvents,
    ).flat(),
  );

describe('petite enfance : les situations de naissance', () => {
  it('donnent à chacune un départ visiblement différent de la famille standard', () => {
    const standard = newGame(undefined, 'earlyChildhood', 'standard');
    for (const situation of birthSituations) {
      if (situation.id === 'standard') {
        continue;
      }
      const state = newGame(undefined, 'earlyChildhood', situation.id);
      const differs =
        state.child.objects.length > 0 ||
        state.child.traits.length > 0 ||
        Object.values(state.child.axes).some((value) => value !== 0) ||
        state.relations.length !== standard.relations.length;
      expect(differs, situation.id).toBe(true);
    }
  });

  it('posent les objets, les traits et les axes de la situation', () => {
    const homeless = newGame(undefined, 'earlyChildhood', 'homeless');
    expect(homeless.child.objects).toEqual(['teddy']);
    expect(homeless.child.traits).toEqual(['resourceful']);
    expect(homeless.child.axes).toEqual({
      energy: -10,
      sociability: 0,
      mind: 12,
      bond: 0,
    });
    // Un seul parent, très présent.
    expect(homeless.relations.map(({ id }) => id)).toEqual(['mother']);
    const rich = newGame(undefined, 'earlyChildhood', 'millionaire');
    expect(rich.child.objects).toHaveLength(4);
    expect(sliceTabs(rich)).toContain('house');
  });

  it('donnent des liens et de l’Attention selon la disponibilité des parents', () => {
    const rich = newGame(undefined, 'earlyChildhood', 'millionaire');
    const poor = newGame(undefined, 'earlyChildhood', 'homeless');
    // Un parent présent et tendre : un lien de départ plus fort.
    expect(firstBond(poor)).toBeGreaterThan(firstBond(rich));
    expect(untilQuarter(poor, 8).child.attention).toBeGreaterThan(
      untilQuarter(rich, 8).child.attention,
    );
  });

  it('répondent aux demandes selon leurs moyens', () => {
    const bike = wishAt('bike');
    const answer = (situation: string) =>
      wishAnswer(newGame(undefined, 'earlyChildhood', situation), bike);
    expect(answer('millionaire')).toBe('yes');
    expect(answer('standard')).toBe('no');
    expect(answer('homeless')).toBe('no');
    expect(answer('farm')).toBe('no');
  });

  it('racontent un même événement autrement selon le contexte', () => {
    const supermarket = required(
      childEvents.find(({ id }) => id === 'supermarket'),
    );
    const texts = ['millionaire', 'rockStar', 'homeless', 'farm'].map(
      (situation) =>
        childEventText(
          newGame(undefined, 'earlyChildhood', situation),
          supermarket,
        ),
    );
    expect(new Set(texts).size).toBe(4);
    expect(texts).not.toContain(supermarket.text);
    for (const situation of ['standard', 'teachers']) {
      expect(
        childEventText(
          newGame(undefined, 'earlyChildhood', situation),
          supermarket,
        ),
      ).toBe(supermarket.text);
    }
  });

  it('ouvrent leurs événements de contexte, et seulement ceux-là', () => {
    const rich = livedIn('millionaire');
    expect(rich.has('hotelHall')).toBe(true);
    expect(rich.has('tourBus')).toBe(false);
    expect(livedIn('rockStar').has('tourBus')).toBe(true);
    expect(livedIn('homeless').has('shelterNight')).toBe(true);
    expect(livedIn('farm').has('henHouse')).toBe(true);
    expect(livedIn('teachers').has('bookShelf')).toBe(true);
    expect(livedIn('standard').has('hotelHall')).toBe(false);
  });

  it('se jouent jusqu’au bilan avec 4 à 8 événements, quelle que soit la graine', () => {
    for (const { id } of birthSituations) {
      for (let seed = 1; seed <= 12; seed += 1) {
        const done = playedBy(id, seed);
        const count = done.child.firedEvents.length;
        expect(count, `${id} ${seed}`).toBeGreaterThanOrEqual(
          childRules.events.min,
        );
        expect(count, `${id} ${seed}`).toBeLessThanOrEqual(
          childRules.events.max + 1,
        );
        expect(canEnterChildhood(done), id).toBe(true);
        expect(done.child.traits.length).toBeLessThanOrEqual(
          childRules.traitLimit,
        );
      }
    }
  });

  it('ne citent que des contextes que une situation donne', () => {
    const tags = new Set(birthSituations.flatMap(({ contexts }) => contexts));
    const used = childEvents.flatMap((event) => [
      ...event.conditions.flatMap((condition) =>
        condition.type === 'context' ? [condition.tag] : [],
      ),
      ...(event.variants ?? []).map(({ context }) => context),
    ]);
    expect(used.length).toBeGreaterThan(0);
    expect(used.every((tag) => tags.has(tag))).toBe(true);
  });

  it('ne contiennent que des objets, des traits et des axes connus', () => {
    const objectIds = new Set(childObjects.map(({ id }) => id));
    const traitIds = new Set(childTraits.map(({ id }) => id));
    for (const situation of birthSituations) {
      expect(
        situation.objects.every((id) => objectIds.has(id)),
        situation.id,
      ).toBe(true);
      expect(
        situation.traits.every((id) => traitIds.has(id)),
        situation.id,
      ).toBe(true);
      expect(
        Object.values(situation.axes).every((value) => Math.abs(value) <= 25),
        situation.id,
      ).toBe(true);
      expect(situation.parents.length, situation.id).toBeGreaterThan(0);
    }
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
    const steps = childObjects.flatMap(({ giftAt }) =>
      giftAt === undefined ? [] : [giftAt],
    );
    expect(new Set(steps).size).toBe(steps.length);
  });

  it('font venir chaque objet d’une source, et chaque activité d’un objet', () => {
    const wished = new Set(childWishes.map(({ object }) => object));
    const found = new Set(childPlaces.flatMap(({ finds }) => finds));
    const events = new Set(
      childEvents.flatMap(({ choices }) =>
        choices.flatMap(({ effects }) =>
          effects.flatMap((effect) =>
            effect.type === 'giveObject' ? [effect.id] : [],
          ),
        ),
      ),
    );
    for (const object of childObjects) {
      const isSourced =
        object.giftAt !== undefined ||
        wished.has(object.id) ||
        found.has(object.id) ||
        events.has(object.id);
      expect(isSourced, object.id).toBe(true);
    }
  });

  it('ne citent que des éléments qui existent', () => {
    const objectIds = new Set(childObjects.map(({ id }) => id));
    const traitIds = new Set(childTraits.map(({ id }) => id));
    for (const event of childEvents) {
      expect(event.choices.length, event.id).toBeGreaterThanOrEqual(2);
      const objectReferences = [
        ...event.conditions.flatMap((condition) =>
          condition.type === 'object' ? [condition.id] : [],
        ),
        ...event.choices.flatMap(({ effects }) =>
          effects.flatMap((effect) =>
            effect.type === 'giveObject' || effect.type === 'removeObject'
              ? [effect.id]
              : [],
          ),
        ),
      ];
      const traitReferences = [
        ...event.conditions.flatMap((condition) =>
          condition.type === 'trait' ? [condition.id] : [],
        ),
        ...event.choices.flatMap(({ effects }) =>
          effects.flatMap((effect) =>
            effect.type === 'trait' ? [effect.id] : [],
          ),
        ),
      ];
      const eventReferences = event.conditions.flatMap((condition) =>
        condition.type === 'event' ? [condition.id] : [],
      );
      expect(
        objectReferences.every((id) => objectIds.has(id)),
        event.id,
      ).toBe(true);
      expect(
        traitReferences.every((id) => traitIds.has(id)),
        event.id,
      ).toBe(true);
      expect(
        eventReferences.every((id) =>
          childEvents.some((other) => other.id === id),
        ),
        event.id,
      ).toBe(true);
    }
    expect(new Set(childEvents.map(({ id }) => id)).size).toBe(
      childEvents.length,
    );
  });

  it('ont au plus un événement obligatoire par âge, et assez d’événements', () => {
    const mandatory = childEvents.filter((event) => event.isMandatory);
    expect(mandatory.map(({ id }) => id)).toEqual(['firstWord', 'firstFriend']);
    expect(childEvents.length).toBeGreaterThanOrEqual(
      childRules.events.max + 4,
    );
  });
});

describe('petite enfance : un joueur virtuel', () => {
  // Il gazouille, puis joue tour à tour ses activités à portée, fouille,
  // réclame et répond à chaque événement : la tranche finit, rien ne le bloque,
  // et sa durée reste dans la cible (une action par seconde, comme le
  // simulateur de vie).
  it('joue la tranche jusqu’aux 6 ans sans rester bloqué', () => {
    let state = baby(11);
    let actions = 0;
    while (!isChildhoodOver(state) && actions < 2000) {
      if (state.child.pendingEvent !== null) {
        state = chooseEvent(state, actions % 3);
        continue;
      }
      const options = availableActivities(state);
      const activity = options[actions % Math.max(options.length, 1)];
      state =
        activity === undefined ? babble(state) : doActivity(state, activity.id);
      actions += 1;
      state = state.child.quarter >= 12 ? explore(state, 'home') : state;
    }
    expect(isChildhoodOver(state)).toBe(true);
    // Un geste par seconde, et dix secondes pour lire et choisir à chaque
    // événement.
    const decisionMs = 10_000;
    const minutes =
      (actions * simulatorConfig.humanCadenceMs +
        state.child.firedEvents.length * decisionMs) /
      60_000;
    expect(minutes).toBeGreaterThanOrEqual(6);
    expect(minutes).toBeLessThanOrEqual(8);
    expect(state.child.traits.length).toBeLessThanOrEqual(
      childRules.traitLimit,
    );
    expect(state.child.firedEvents.length).toBeGreaterThanOrEqual(
      childRules.events.min,
    );
  });
});
