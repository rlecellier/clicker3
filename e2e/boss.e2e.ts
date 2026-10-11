import { expect, test } from '@playwright/test';
import { amountOf, counter, itemOf, preloadSave } from './helpers';

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
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu');
  await page.getByRole('tab', { name: 'Améliorations' }).click();

  // Sans amélioration d'automatisation, aucun interrupteur.
  await expect(
    page.getByRole('switch', { name: 'Travail automatique' }),
  ).toBeHidden();

  // Procédure de travail : réservée aux dirigeants.
  const procedure = itemOf(page, 'Procédure de travail');
  await expect(
    procedure.getByRole('button', { name: 'Acheter' }),
  ).toBeDisabled();

  // Le premier collaborateur fait de vous un dirigeant.
  const employee = itemOf(page, 'Premier collaborateur');
  await employee.getByRole('button', { name: 'Acheter' }).click();
  await expect(
    page.getByText('Dirigeant (sans équipe de direction)'),
  ).toBeVisible();

  // Les automatisations apparaissent en interrupteurs, coupés au départ.
  await procedure.getByRole('button', { name: 'Acheter' }).click();
  await itemOf(page, 'Rythme de sommeil optimisé')
    .getByRole('button', { name: 'Acheter' })
    .click();
  const autoWork = page.getByRole('switch', { name: 'Travail automatique' });
  const autoSleep = page.getByRole('switch', { name: 'Sommeil automatique' });
  await expect(autoWork).not.toBeChecked();
  await expect(autoSleep).not.toBeChecked();

  // Activé, le travail rapporte seul ; coupé, il s'arrête.
  const money = () => amountOf(counter(page, 'Argent'));
  await autoWork.click();
  await expect(autoWork).toBeChecked();
  const started = await money();
  await page.clock.runFor(20_000);
  await expect.poll(money).toBeGreaterThan(started);
  await autoWork.click();
  await expect(autoWork).not.toBeChecked();
  const stopped = await money();
  await page.clock.runFor(20_000);
  expect(await money()).toBe(stopped);

  // Le sommeil automatique s'active aussi.
  await autoSleep.click();
  await expect(autoSleep).toBeChecked();

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
});
