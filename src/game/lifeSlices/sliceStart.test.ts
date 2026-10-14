import { describe, expect, it } from 'vitest';
import { companies, districts, jobs, lifeSlices, upgrades } from '@game/data';
import { unreadMail } from '@game/mail';
import { newGame, reduce } from '@game/reducer';
import { isRequirementMet } from '@game/requirements';
import { simulateLife } from '@game/simulator';
import { statIds } from '@game/state';
import { dateOf, ageOf } from '@game/time';
import { lifeFigures } from '@game/summary';

const adultSlices = lifeSlices.filter(({ start }) => start !== null);

describe('départs en cours de vie', () => {
  it('couvre âge adulte, maturité et vieillesse', () => {
    expect(adultSlices.map(({ id }) => id)).toEqual([
      'adulthood',
      'maturity',
      'oldAge',
    ]);
  });

  describe.each(adultSlices)('$name', (slice) => {
    const start = slice.start;
    if (start === null) {
      throw new Error('tranche sans départ');
    }
    const state = newGame(undefined, slice.id);

    it('ne désigne que des éléments qui existent', () => {
      expect(jobs.map(({ id }) => id)).toContain(start.jobId);
      for (const id of start.upgrades) {
        expect(upgrades.map((upgrade) => upgrade.id)).toContain(id);
      }
      for (const id of Object.keys(start.companies)) {
        expect(companies.map((company) => company.id)).toContain(id);
      }
      for (const id of start.districts) {
        expect(districts.map((district) => district.id)).toContain(id);
      }
    });

    it('remplit les conditions de son emploi et de ses améliorations', () => {
      const job = jobs.find(({ id }) => id === start.jobId);
      expect(isRequirementMet(state, job?.requirement)).toBe(true);
      expect(statIds.every((stat) => state.stats[stat] >= 0)).toBe(true);
      const placed = Object.values(start.placements).reduce(
        (sum, amount) => sum + amount,
        0,
      );
      expect(placed).toBeLessThanOrEqual(start.money);
    });

    it('commence à son âge, à la bonne date, partie en cours', () => {
      expect(ageOf(state)).toBe(start.age);
      expect(dateOf(state)).toEqual({ year: 1999 + start.age - 18, month: 1 });
      expect(state.lifeSlice).toBe(slice.id);
      expect(state.status).toBe('playing');
      expect(lifeFigures(state).age).toBe(start.age);
    });

    it('dérive le loyer, les salaires et le stock des améliorations', () => {
      expect(state.housingId).not.toBe('studio');
      expect(state.rent).toBeGreaterThan(0);
      expect(state.payroll).toBeGreaterThan(0);
      expect(state.stockCapacity).toBeGreaterThanOrEqual(start.stock);
    });

    it('ne déclenche aucun événement passé et laisse le courrier lu', () => {
      // Seule la ligne de l'anniversaire du départ peut figurer au courrier.
      expect(
        state.events.filter(({ id }) => !id.startsWith('birthday-')),
      ).toEqual([]);
      expect(unreadMail(state)).toBe(0);
      expect(state.phase).toBe('boss');
    });

    it('se joue jusqu’à la mort sans rester bloqué', () => {
      const result = simulateLife(state);
      expect(result.endedBy).toBe('death');
    });
  });

  it('fête l’anniversaire du départ quand il en existe un', () => {
    for (const id of ['adulthood', 'maturity'] as const) {
      const state = newGame(undefined, id);
      expect(state.pendingBirthday?.age).toBe(ageOf(state));
      const answered = reduce(state, { type: 'answerBirthday' });
      expect(answered.pendingBirthday).toBeNull();
    }
  });

  it('commence sans fenêtre quand il n’y a pas d’anniversaire à cet âge', () => {
    const state = newGame(undefined, 'oldAge');
    expect(state.pendingBirthday).toBeNull();
    expect(state.birthdayBase.age).toBe(65);
  });
});
