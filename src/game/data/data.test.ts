import { describe, expect, it } from 'vitest';
import type { Requirement } from '@game/requirements';
import { actionRules } from './actionRules';
import { companies } from './companies';
import { courses } from './courses';
import { districts } from './districts';
import { economyRules } from './economyRules';
import { events } from './events';
import { findById } from './findById';
import { impactRules } from './impactRules';
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

  it('les règles d’impact citent des ids existants et couvrent chaque quartier', () => {
    const { companyDistricts, inequality, homeDistrict } = impactRules;
    expect(ids.district.has(homeDistrict)).toBe(true);
    expect(new Set(Object.keys(companyDistricts))).toEqual(ids.company);
    expect(
      Object.values(companyDistricts).filter((id) => !ids.district.has(id)),
    ).toEqual([]);
    // Un quartier sans richesse des habitants donnerait 100 d'inégalités
    // dès le premier euro.
    expect(new Set(Object.keys(inequality.residentWealth))).toEqual(
      ids.district,
    );
    expect(
      Object.values(inequality.residentWealth).every((wealth) => wealth > 0),
    ).toBe(true);
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

describe('findById', () => {
  it('trouve un élément par son id', () => {
    expect(findById(jobs, 'interim')?.name).toBe(jobs[0]?.name);
  });

  it('rend undefined pour un id inconnu ou absent', () => {
    expect(findById(jobs, 'inconnu')).toBeUndefined();
    expect(findById(jobs, null)).toBeUndefined();
    expect(findById(jobs, undefined)).toBeUndefined();
  });
});

// Crédibilité des données (issue #166, propositions-equilibrage.md § 4) : une
// période est un mois, 8 h de travail par jour sont payées au salaire de base.
const byName = (first: string, second: string) => first.localeCompare(second);

describe('crédibilité des salaires, du train de vie et des employés', () => {
  const { overtime, gauge } = actionRules.work;
  // Actions de travail qui remplissent les 8 h de la journée.
  const regularActions = overtime.regularGauge / gauge;
  const monthlyWage = (salary: number) => salary * regularActions;
  const housings = upgrades.flatMap((upgrade) =>
    upgrade.effects.flatMap((effect) =>
      effect.type === 'housing' ? [effect] : [],
    ),
  );
  // Tout ce qui ajoute un salaire à payer (employés et assistante).
  const employees = upgrades.filter((upgrade) => (upgrade.payroll ?? 0) > 0);

  it('compte un nombre entier d’actions pour les 8 h de travail', () => {
    expect(Number.isSafeInteger(regularActions)).toBe(true);
    // Une journée = ce qu'il reste de la jauge après un sommeil complet.
    expect(overtime.regularGauge).toBeLessThanOrEqual(
      startState.gaugeCapacity - actionRules.sleep.gauge,
    );
  });

  it('paie un emploi entre 800 et 8 000 € par mois', () => {
    const outside = jobs
      .map((job) => ({ id: job.id, monthly: monthlyWage(job.salary) }))
      .filter(({ monthly }) => monthly < 800 || monthly > 8000);
    expect(outside).toEqual([]);
  });

  it('paie davantage à chaque emploi', () => {
    const wages = jobs.map((job) => job.salary);
    expect(wages).toEqual(wages.toSorted((first, second) => first - second));
  });

  it('laisse vivre du premier emploi : loyer et train de vie couverts', () => {
    const first = jobs[0];
    expect(first).toBeDefined();
    expect(monthlyWage(first?.salary ?? 0)).toBeGreaterThan(
      startState.rent + economyRules.baseLivingCost,
    );
  });

  it('majore les heures supplémentaires de plus en plus', () => {
    const wages = overtime.tiers.map((tier) => tier.wage);
    const starts = overtime.tiers.map((tier) => tier.from);
    expect(wages.every((wage) => wage > 1)).toBe(true);
    expect(wages).toEqual(wages.toSorted((first, second) => first - second));
    expect(starts[0]).toBe(overtime.regularGauge);
    expect(starts).toEqual(starts.toSorted((first, second) => first - second));
    expect(overtime.gaugeSurcharge).toBeGreaterThan(0);
  });

  it('donne un train de vie à chaque logement, qui monte avec lui', () => {
    const ids = housings.map((housing) => housing.housingId);
    expect(Object.keys(economyRules.livingCosts).toSorted(byName)).toEqual(
      ids.toSorted(byName),
    );
    const costs = ids.map(
      (id) => economyRules.livingCosts[id] ?? economyRules.baseLivingCost,
    );
    expect(costs).toEqual(costs.toSorted((first, second) => first - second));
    expect(costs.every((cost) => cost > economyRules.baseLivingCost)).toBe(
      true,
    );
  });

  it('paie un employé au moins le SMIC chargé', () => {
    expect(employees.length).toBeGreaterThan(0);
    const cheap = employees.filter(
      (upgrade) => (upgrade.payroll ?? 0) < economyRules.minimumEmployeeCost,
    );
    expect(cheap.map((upgrade) => upgrade.id)).toEqual([]);
  });

  it('paie des employés de plus en plus chers', () => {
    const payrolls = upgrades
      .filter((upgrade) =>
        upgrade.effects.some((effect) => effect.type === 'employee'),
      )
      .map((upgrade) => upgrade.payroll ?? 0);
    expect(payrolls).toEqual(
      payrolls.toSorted((first, second) => first - second),
    );
  });
});

// Crédibilité des entreprises (issue #167, propositions-equilibrage.md § 3 C et D).
// Rapport entre le prix du dernier exemplaire et celui du premier.
const lastCopyRatio = (company: (typeof companies)[number]) =>
  company.growth ** (company.maxCopies - 1);
// Mois pour rembourser une paire production + commerce d'après le débit de
// base (articles produits ou vendus, le plus petit des deux, au prix du commerce).
const payback = (productionId: string, commerceId: string) => {
  const production = companies.find((company) => company.id === productionId);
  const commerce = companies.find((company) => company.id === commerceId);
  if (production?.kind !== 'production' || commerce?.kind !== 'commerce') {
    throw new Error('paire invalide');
  }
  const monthly =
    Math.min(production.output, commerce.capacity) * commerce.price;
  return (production.baseCost + commerce.baseCost) / monthly;
};

describe('crédibilité des entreprises, des charges et de la montée en gamme', () => {
  it('ne dépasse jamais 10 fois le prix de base pour un exemplaire', () => {
    const outside = companies
      .filter((company) => lastCopyRatio(company) > 10)
      .map((company) => company.id);
    expect(outside).toEqual([]);
  });

  it('plafonne chaque type : quelques dizaines d’établissements au total', () => {
    const total = companies.reduce(
      (sum, company) => sum + company.maxCopies,
      0,
    );
    expect(total).toBeGreaterThanOrEqual(20);
    expect(total).toBeLessThanOrEqual(60);
  });

  it('place chaque type dans un quartier existant', () => {
    for (const company of companies) {
      const district = impactRules.companyDistricts[company.id];
      expect(ids.district.has(district ?? ''), company.id).toBe(true);
    }
  });

  it('rembourse une paire production + commerce en 10 à 36 mois de débit de base', () => {
    expect(payback('atelier', 'boutique')).toBeGreaterThanOrEqual(10);
    // Les multiplicateurs de milieu de partie (employés, bonus de travail)
    // ramènent ce retour vers les 10 à 18 mois visés (equilibrage.md).
    expect(payback('atelier', 'boutique')).toBeLessThanOrEqual(36);
  });

  it('ouvre par des micro-activités à quelques milliers d’euros', () => {
    for (const id of ['etabli', 'stand']) {
      const company = companies.find((candidate) => candidate.id === id);
      expect(company?.baseCost, id).toBeLessThanOrEqual(5000);
    }
    expect(payback('etabli', 'stand')).toBeGreaterThanOrEqual(6);
    expect(payback('etabli', 'stand')).toBeLessThanOrEqual(24);
  });

  it('prélève une mensualité de crédit proportionnelle à l’apport', () => {
    // Crédit de même montant que l'apport, à 6 % sur 7 ans (1,46 % par mois).
    const financed = companies.filter((company) => company.baseCost >= 30_000);
    expect(financed.length).toBeGreaterThan(0);
    for (const company of financed) {
      const ratio = company.charges / company.baseCost;
      expect(ratio, company.id).toBeGreaterThan(0.014);
      expect(ratio, company.id).toBeLessThan(0.015);
    }
    expect(companies.every((company) => company.charges >= 0)).toBe(true);
  });

  it('garde les charges d’un exemplaire sous le double de ses recettes de base', () => {
    for (const company of companies) {
      const revenue =
        company.kind === 'commerce'
          ? company.capacity * company.price
          : company.output * 12;
      expect(company.charges, company.id).toBeLessThan(2 * revenue);
    }
  });

  it('offre trois niveaux de montée en gamme, de plus en plus chers, à chaque entreprise financée à crédit', () => {
    const financed = companies.filter((company) => company.baseCost >= 30_000);
    for (const company of financed) {
      const chain = upgrades.filter((candidate) =>
        candidate.effects.some(
          (effect) =>
            effect.type === 'companyBonus' && effect.companyId === company.id,
        ),
      );
      expect(chain, company.id).toHaveLength(3);
      // Le premier niveau est le moins cher ; les suivants coûtent plus.
      const [first, ...others] = chain.map((upgrade) => upgrade.price);
      for (const price of others) {
        expect(price, company.id).toBeGreaterThan(first ?? Infinity);
      }
      // Le premier niveau demande des exemplaires, sans dépasser le plafond.
      const requirement = chain[0]?.requirement;
      expect(requirement?.type).toBe('company');
      if (requirement?.type !== 'company') {
        continue;
      }

      expect(requirement.id).toBe(company.id);
      expect(requirement.count ?? 1).toBeLessThanOrEqual(company.maxCopies);
    }
  });
});
