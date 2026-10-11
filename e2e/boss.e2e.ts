import { expect, test } from '@playwright/test';
import { upgrades } from '@game/data';
import { amountOf, counter, itemOf, longPress, preloadSave } from './helpers';

// Seule la prochaine amélioration est proposée : on possède déjà toutes les
// autres, pour n'acheter que celles du parcours, dans l'ordre des prix.
const journey = new Set([
  'premier-collaborateur',
  'tableau-de-bord',
  'rythme-sommeil',
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
      stats: { metier: 0, gestion: 30, intelligence: 30, endurance: 0 },
      upgrades: upgrades
        .map((upgrade) => upgrade.id)
        .filter((id) => !journey.has(id)),
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu');
  await page.getByRole('tab', { name: 'Améliorations' }).click();
  const work = page.getByRole('button', { name: /Travailler/ });
  const sleep = page.getByRole('button', { name: /Dormir/ });
  const workOn = page.getByText('Appui long : couper l’automatique');

  // Sans amélioration d'automatisation, aucun appui long ne s'annonce.
  await expect(page.getByText(/Appui long/)).toBeHidden();

  // Le premier collaborateur fait de vous un dirigeant.
  await itemOf(page, 'Premier collaborateur')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await expect(
    page.getByText('Dirigeant (sans équipe de direction)'),
  ).toBeVisible();

  // Le tableau de bord remplace les comptes simplifiés.
  await page.getByRole('tab', { name: 'Comptabilité' }).click();
  await expect(
    page.getByRole('table', { name: 'Comptes (version simplifiée)' }),
  ).toBeVisible();
  await itemOf(page, 'Tableau de bord')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await expect(
    page.getByRole('table', { name: 'Tableau de bord' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: '· Vente du surplus' }),
  ).toBeVisible();

  // Les automatisations s'achètent, coupées au départ.
  await itemOf(page, 'Rythme de sommeil optimisé')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await itemOf(page, 'Procédure de travail')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await expect(page.getByText('Appui long : automatique')).toHaveCount(2);

  // Un appui long sur Travailler l'active : le travail rapporte seul. Le clic
  // qui suit le relâchement ne compte pas comme un travail manuel.
  const money = () => amountOf(counter(page, 'Argent'));
  const beforeLongPress = await money();
  await longPress(page, work);
  await expect(workOn).toBeVisible();
  await expect(page.getByText('Travail automatique activé.')).toBeVisible();
  expect(await money()).toBe(beforeLongPress);
  await page.clock.runFor(1000);
  await expect.poll(money).toBeGreaterThan(beforeLongPress);

  // Un second appui long le coupe.
  await longPress(page, work);
  await expect(workOn).toBeHidden();
  const stopped = await money();
  await page.clock.runFor(20_000);
  expect(await money()).toBe(stopped);

  // Le sommeil automatique s'active de la même façon.
  await longPress(page, sleep);
  await expect(page.getByText('Sommeil automatique activé.')).toBeVisible();
  await expect(page.getByText('Appui long : couper l’automatique')).toHaveCount(
    1,
  );
});
