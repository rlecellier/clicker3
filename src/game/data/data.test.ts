import { describe, expect, it } from 'vitest';
import type { Requirement } from '@game/requirements';
import { companies } from './companies';
import { courses } from './courses';
import { districts } from './districts';
import { events } from './events';
import { jobs } from './jobs';
import { startState } from './startState';
import { upgrades } from './upgrades';

const ids = {
  company: new Set(companies.map(({ id }) => id)),
  upgrade: new Set(upgrades.map(({ id }) => id)),
  district: new Set(districts.map(({ id }) => id)),
  job: new Set(jobs.map(({ id }) => id)),
  course: new Set(courses.map(({ id }) => id)),
};

// Les références d'une condition (branches all/any comprises) qui ne
// désignent aucun élément des données.
const brokenReferences = (requirement: Requirement | undefined): string[] => {
  if (requirement === undefined) {
    return [];
  }
  switch (requirement.type) {
    case 'company': {
      return ids.company.has(requirement.id)
        ? []
        : [`company:${requirement.id}`];
    }
    case 'upgrade': {
      return ids.upgrade.has(requirement.id)
        ? []
        : [`upgrade:${requirement.id}`];
    }
    case 'district': {
      return ids.district.has(requirement.id)
        ? []
        : [`district:${requirement.id}`];
    }
    case 'all':
    case 'any': {
      return requirement.of.flatMap((part) => brokenReferences(part));
    }
    default: {
      return [];
    }
  }
};

const duplicates = (list: readonly { id: string }[]) =>
  list
    .map(({ id }) => id)
    .filter((id, index, all) => all.indexOf(id) !== index);

describe('cohérence des données', () => {
  it.each([
    ['entreprises', companies],
    ['améliorations', upgrades],
    ['quartiers', districts],
    ['emplois', jobs],
    ['cours', courses],
    ['événements', events],
  ])('les ids des %s sont uniques', (_name, list) => {
    expect(duplicates(list)).toEqual([]);
  });

  it.each([
    ['entreprises', companies],
    ['améliorations', upgrades],
    ['quartiers', districts],
    ['emplois', jobs],
  ] as const)('les conditions des %s citent des ids existants', (_n, list) => {
    const broken = list.flatMap(({ id, requirement }) =>
      brokenReferences(requirement).map((ref) => `${id} -> ${ref}`),
    );
    expect(broken).toEqual([]);
  });

  it('les déclencheurs des événements citent des ids existants', () => {
    const broken = events.flatMap(({ id, trigger }) =>
      brokenReferences(trigger).map((ref) => `${id} -> ${ref}`),
    );
    expect(broken).toEqual([]);
  });

  it('les effets des améliorations citent des cours et entreprises existants', () => {
    const broken: string[] = [];
    for (const { id, effects } of upgrades) {
      for (const effect of effects) {
        if (effect.type === 'course' && !ids.course.has(effect.courseId)) {
          broken.push(`${id} -> course:${effect.courseId}`);
        }
        if (
          effect.type === 'productionBonus' &&
          effect.companyId !== undefined &&
          !ids.company.has(effect.companyId)
        ) {
          broken.push(`${id} -> company:${effect.companyId}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('les effets des événements citent des emplois existants', () => {
    const broken = events.flatMap(({ id, effects = [] }) =>
      effects.flatMap((effect) =>
        effect.type === 'jobSalaryFactor'
          ? effect.jobIds
              .filter((jobId) => !ids.job.has(jobId))
              .map((jobId) => `${id} -> job:${jobId}`)
          : [],
      ),
    );
    expect(broken).toEqual([]);
  });

  it("l'état de départ cite des ids existants", () => {
    expect(startState.districts.filter((id) => !ids.district.has(id))).toEqual(
      [],
    );
    expect(
      Object.keys(startState.companies).filter((id) => !ids.company.has(id)),
    ).toEqual([]);
    expect(startState.upgrades.filter((id) => !ids.upgrade.has(id))).toEqual(
      [],
    );
  });

  it('détecte une faute de frappe', () => {
    expect(
      brokenReferences({
        type: 'all',
        of: [{ type: 'any', of: [{ type: 'company', id: 'bakery' }] }],
      }),
    ).toEqual(['company:bakery']);
  });
});
