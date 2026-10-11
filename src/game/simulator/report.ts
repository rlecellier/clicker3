import { PERIODS_PER_YEAR } from '@game/time';
import { simulatorConfig } from './config';
import type { CurvePoint, SimulationResult } from './simulate';

const minutesLabel = (minutes: number) => {
  const whole = Math.floor(minutes);
  const seconds = Math.round((minutes - whole) * 60);
  return `${whole} min ${String(seconds).padStart(2, '0')} s`;
};

const pad = (value: number | string, width: number) =>
  String(value).padStart(width, ' ');

const rowOf = (point: CurvePoint) =>
  [
    pad(point.age, 3),
    pad(point.minutes.toFixed(1), 7),
    pad(Math.round(point.money), 12),
    pad(Math.round(point.stock), 7),
    pad(point.reputation.toFixed(1), 8),
    pad(point.companies, 5),
    pad(point.upgrades, 5),
    pad(Math.round(point.revenue), 10),
  ].join(' | ');

/** Résumé lisible en console : durée, jalons, zone morte, puis la courbe par an. */
export const formatReport = (result: SimulationResult): string => {
  const lines = [
    `Fin : ${result.endedBy} — ${result.manualActions} actions manuelles`,
    `Durée de jeu actif estimée : ${minutesLabel(result.activeMs / 60_000)}` +
      ` (+ ${minutesLabel(result.waitMs / 60_000)} d'attente des automatismes,` +
      ` ${minutesLabel(result.elapsedMs / 60_000)} au total)`,
    `Phases atteintes : ${result.phasesReached.join(', ')}`,
    `Plus longue zone morte : ${minutesLabel(result.longestGapMs / 60_000)}` +
      ` (à partir de ${minutesLabel(result.longestGapAtMinutes)})`,
    `Zones mortes de plus de ${minutesLabel(simulatorConfig.maxDeadZoneMs / 60_000)} : ${result.deadZones.length}` +
      (result.deadZones.length === 0
        ? ''
        : ` (${result.deadZones
            .map(
              (zone) =>
                `${minutesLabel(zone.minutes)} à ${minutesLabel(zone.atMinutes)}`,
            )
            .join(' ; ')})`),
    '',
    'Jalons',
    ...result.milestones.map(
      (milestone) =>
        `  ${milestone.label.padEnd(34)} ${pad(milestone.age, 3)} ans` +
        `  ${minutesLabel(milestone.minutes)}`,
    ),
    '',
    [
      'âge',
      'minutes',
      'argent',
      'stock',
      'réput.',
      'entr.',
      'amél.',
      'recettes',
    ]
      .map((title, index) => pad(title, [3, 7, 12, 7, 8, 5, 5, 10][index] ?? 8))
      .join(' | '),
    ...result.curve
      .filter((point) => point.period % PERIODS_PER_YEAR === 0)
      .map((point) => rowOf(point)),
  ];
  return lines.join('\n');
};

/** La courbe complète (une ligne par période), au format CSV. */
export const formatCsv = (result: SimulationResult): string =>
  [
    'period,age,minutes,money,stock,reputation,companies,upgrades,revenue',
    ...result.curve.map((point) =>
      [
        point.period,
        point.age,
        point.minutes.toFixed(2),
        Math.round(point.money),
        Math.round(point.stock),
        point.reputation.toFixed(2),
        point.companies,
        point.upgrades,
        Math.round(point.revenue),
      ].join(','),
    ),
  ].join('\n');
