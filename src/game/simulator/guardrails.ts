import { upgrades } from '@game/data';
import type { Upgrade } from '@game/data';
import { statIds } from '@game/state';
import { guardrailConfig } from './config';
import { simulateLife } from './simulate';
import type { SimulationResult } from './simulate';

export type GuardrailKind = 'utility' | 'boost' | 'stats';

export type GuardrailCheck = {
  kind: GuardrailKind;
  // Amélioration testée (ou « stats »).
  subject: string;
  isOk: boolean;
  detail: string;
};

/** Les mesures comparées par le test d'utilité. */
export type LifeMeasures = {
  // Âge du travail automatique (infini : jamais atteint).
  autoWorkAge: number;
  // Recettes de la période à 60 ans (0 : jamais atteint).
  revenueAtSixty: number;
  activeMinutes: number;
};

export const measuresOf = (result: SimulationResult): LifeMeasures => ({
  autoWorkAge:
    result.milestones.find((entry) => entry.id === 'autoWork')?.age ?? Infinity,
  revenueAtSixty:
    result.curve.find((point) => point.age >= guardrailConfig.revenueAge)
      ?.revenue ?? 0,
  activeMinutes: result.activeMs / 60_000,
});

/**
 * De combien le variant dégrade la référence, par mesure (0,05 : 5 % de
 * moins bien ; négatif : le variant fait mieux).
 */
export const degradations = (
  reference: LifeMeasures,
  variant: LifeMeasures,
): LifeMeasures => ({
  autoWorkAge: variant.autoWorkAge / reference.autoWorkAge - 1,
  revenueAtSixty:
    reference.revenueAtSixty === 0
      ? 0
      : 1 - variant.revenueAtSixty / reference.revenueAtSixty,
  activeMinutes: variant.activeMinutes / reference.activeMinutes - 1,
});

const percent = (ratio: number) =>
  Number.isFinite(ratio) ? `${(ratio * 100).toFixed(1)} %` : 'jamais';

/** Test d'utilité : retirer l'amélioration dégrade-t-il une mesure de 5 % ? */
export const utilityCheck = (
  upgrade: Upgrade,
  reference: LifeMeasures,
  variant: LifeMeasures,
): GuardrailCheck => {
  const gap = degradations(reference, variant);
  const worst = Math.max(
    gap.autoWorkAge,
    gap.revenueAtSixty,
    gap.activeMinutes,
  );
  return {
    kind: 'utility',
    subject: upgrade.id,
    isOk: worst >= guardrailConfig.minUtility,
    detail:
      `sans elle : travail auto ${percent(gap.autoWorkAge)}, ` +
      `recettes ${percent(gap.revenueAtSixty)}, ` +
      `jeu actif ${percent(gap.activeMinutes)}`,
  };
};

// Logements et coups de pouce : ce qui doit arriver avant la fin des stats.
const isBoost = (upgrade: Upgrade) =>
  upgrade.effects.some((effect) => effect.type === 'housing');

/** Part des points de stat de la vie gagnés après l'achat du boost. */
export const boostCheck = (
  upgrade: Upgrade,
  result: SimulationResult,
): GuardrailCheck => {
  const purchase = result.upgradePurchases.find(
    (entry) => entry.id === upgrade.id,
  );
  if (purchase === undefined || result.statPointsTotal === 0) {
    return {
      kind: 'boost',
      subject: upgrade.id,
      isOk: false,
      detail: 'jamais acheté',
    };
  }
  const share = 1 - purchase.statPoints / result.statPointsTotal;
  return {
    kind: 'boost',
    subject: upgrade.id,
    isOk: share >= guardrailConfig.minBoostShare,
    detail: `${percent(share)} des points de stat gagnés après l'achat (minute ${purchase.minutes.toFixed(1)})`,
  };
};

/** Stats vivantes : un dernier palier atteint après la minute 25. */
export const statsCheck = (result: SimulationResult): GuardrailCheck => {
  const latest = Math.max(
    -Infinity,
    ...statIds.map((stat) => result.statMaxMinutes[stat] ?? -Infinity),
  );
  return {
    kind: 'stats',
    subject: 'stats',
    isOk: latest > guardrailConfig.statLivelyMinute,
    detail: Number.isFinite(latest)
      ? `dernier palier atteint à la minute ${latest.toFixed(1)}`
      : 'aucun dernier palier atteint',
  };
};

const exempt: readonly string[] = guardrailConfig.exemptUpgrades;

const isExempt = (upgrade: Upgrade) =>
  exempt.includes(upgrade.id) ||
  upgrade.effects.some(
    (effect) => effect.type === 'course' || effect.type === 'automation',
  );

/** Lance les trois garde-fous : une vie de référence, une vie par amélioration retirée. */
export const runGuardrails = (
  reference: SimulationResult = simulateLife(),
): GuardrailCheck[] => {
  const base = measuresOf(reference);
  return [
    ...upgrades
      .filter((upgrade) => !isExempt(upgrade))
      .map((upgrade) =>
        utilityCheck(
          upgrade,
          base,
          measuresOf(
            simulateLife(undefined, { excludedUpgrades: [upgrade.id] }),
          ),
        ),
      ),
    ...upgrades
      .filter((upgrade) => isBoost(upgrade))
      .map((upgrade) => boostCheck(upgrade, reference)),
    statsCheck(reference),
  ];
};

/** Résumé lisible en console, un contrôle par ligne. */
export const formatGuardrails = (
  checks: readonly GuardrailCheck[],
  knownFailures: readonly string[] = [],
): string =>
  [
    'Garde-fous d’équilibrage',
    ...checks.map((check) => {
      const key = `${check.kind}:${check.subject}`;
      const failure = knownFailures.includes(key) ? 'CONNU  ' : 'ÉCHEC  ';
      const status = check.isOk ? 'OK     ' : failure;
      return `  ${status} ${key.padEnd(34)} ${check.detail}`;
    }),
  ].join('\n');
