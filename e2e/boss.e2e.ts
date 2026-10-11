import { expect, test } from '@playwright/test';
import { upgrades } from '@game/data';
import {
  amountOf,
  counter,
  itemOf,
  longPress,
  openTab,
  preloadSave,
} from './helpers';

// On possède déjà toutes les améliorations hors parcours, pour n'acheter que
// celles du parcours, dans l'ordre des prix.
const journey = new Set([
  'premier-collaborateur',
  'tableau-de-bord',
  'procedure-travail',
]);

test('patron : premier collaborateur, travail automatique, tableau de bord', async ({
  page,
}) => {
  await page.clock.install();
  await preloadSave(page, {
    state: {
      money: 100_000,
      companies: { atelier: 1 },
      phase: 'entrepreneur',
      // Gestion et intelligence sont au dernier palier : leurs cursus sont
      // débloqués mais inutiles.
      stats: { metier: 0, gestion: 81, intelligence: 81, endurance: 0 },
      upgrades: upgrades
        .map((upgrade) => upgrade.id)
        .filter((id) => !journey.has(id)),
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu/vie');
  const work = page.getByRole('button', { name: /Travailler/ });
  const workOn = page.getByText('Appui long : couper l’automatique');
  const openUpgrades = async () => {
    await openTab(page, 'investir');
    await page.getByRole('tab', { name: 'Améliorations' }).click();
  };

  // Sans amélioration d'automatisation, aucun appui long ne s'annonce.
  await expect(page.getByText(/Appui long/)).toBeHidden();

  // La flèche d'Étudier ne propose que les cursus dont la compétence peut
  // encore progresser.
  await page.getByRole('button', { name: 'Choisir le cursus' }).click();
  const courseMenu = page.getByRole('menuitemradio');
  await expect(courseMenu).toHaveCount(2);
  await expect(courseMenu.filter({ hasText: /Posture/ })).toHaveCount(1);
  await expect(courseMenu.filter({ hasText: /Dépassement/ })).toHaveCount(1);

  // La mini-jauge sous « Étudier » suit le cursus choisi.
  await page.keyboard.press('Escape');
  const miniGauge = (stat: string) =>
    page.getByRole('progressbar', { name: new RegExp(`^${stat} · palier`) });
  await expect(miniGauge('Métier')).toBeVisible();
  await page.getByRole('button', { name: 'Choisir le cursus' }).click();
  await courseMenu.filter({ hasText: /Dépassement/ }).click();
  await expect(miniGauge('Endurance')).toBeVisible();
  await expect(miniGauge('Métier')).toBeHidden();

  // Le premier collaborateur fait de vous un dirigeant.
  await openUpgrades();
  await itemOf(page, 'Premier collaborateur')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await openTab(page, 'vie');
  await expect(
    page.getByText('Dirigeant (sans équipe de direction)'),
  ).toBeVisible();

  // Le tableau de bord remplace les comptes simplifiés.
  await openTab(page, 'comptes');
  await expect(
    page.getByRole('table', { name: 'Comptes (version simplifiée)' }),
  ).toBeVisible();
  await openUpgrades();
  await itemOf(page, 'Tableau de bord')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await openTab(page, 'comptes');
  await expect(
    page.getByRole('table', { name: 'Tableau de bord' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: '· Vente du surplus' }),
  ).toBeVisible();

  // Le stock a son propre onglet : entrées, sorties, pertes.
  await page.getByRole('tab', { name: 'Stock' }).click();
  await expect(page.getByRole('cell', { name: 'Entrées' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Sorties' })).toBeVisible();
  await page.getByRole('tab', { name: 'Comptabilité' }).click();

  // Maintenir Travailler répète l'action à 4 clics par seconde : bien plus
  // qu'un clic seul, et plus rien une fois le doigt levé.
  await openTab(page, 'vie');
  const money = () => amountOf(counter(page, 'Argent'));
  const beforeClick = await money();
  await work.click();
  const oneClick = (await money()) - beforeClick;
  expect(oneClick).toBeGreaterThan(0);
  const beforeHold = await money();
  await work.hover();
  await page.mouse.down();
  await page.clock.runFor(1000);
  await page.mouse.up();
  const afterHold = await money();
  expect(afterHold - beforeHold).toBeGreaterThanOrEqual(oneClick * 3);
  await page.clock.runFor(2000);
  expect(await money()).toBe(afterHold);

  // L'automatisation s'achète, coupée au départ.
  await openUpgrades();
  await itemOf(page, 'Procédure de travail')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await openTab(page, 'vie');
  await expect(page.getByText('Appui long : automatique')).toHaveCount(1);

  // Un appui long sur Travailler l'active sans interrompre la répétition ;
  // le clic qui suit le relâchement ne compte pas comme un travail de plus.
  await longPress(page, work);
  await expect(workOn).toBeVisible();
  await expect(page.getByText('Travail automatique activé.')).toBeVisible();
  const afterLongPress = await money();
  await page.clock.runFor(1000);
  await expect.poll(money).toBeGreaterThan(afterLongPress);

  // Un second appui long le coupe.
  await longPress(page, work);
  await expect(workOn).toBeHidden();
  const stopped = await money();
  await page.clock.runFor(20_000);
  expect(await money()).toBe(stopped);

  // Quand tout est au dernier palier, « Étudier » disparaît sans que les
  // autres boutons bougent ; le raccourci E ne fait plus rien.
  const sellSurplus = page.getByRole('button', { name: /Vendre le surplus/ });
  const boxes = async () => [
    await work.boundingBox(),
    await sellSurplus.boundingBox(),
  ];
  const boxesBefore = await boxes();
  await preloadSave(page, {
    state: {
      money: 100_000,
      phase: 'entrepreneur',
      stats: { metier: 81, gestion: 81, intelligence: 81, endurance: 81 },
      upgrades: upgrades.map((upgrade) => upgrade.id),
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu/vie');
  await expect(page.getByRole('button', { name: 'Étudier' })).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Choisir le cursus' }),
  ).toBeHidden();
  expect(await boxes()).toEqual(boxesBefore);
  const richMoney = await money();
  await page.keyboard.press('e');
  expect(await money()).toBe(richMoney);
});
