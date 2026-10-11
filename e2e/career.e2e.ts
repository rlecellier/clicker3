import { expect, test } from '@playwright/test';
import { amountOf, counter, itemOf, repeatUntil } from './helpers';

test('début de carrière : travailler, acheter un stage, étudier, dormir', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Démarrer ma vie' }).click();
  await expect(
    page.getByRole('heading', { name: 'Camille Morel' }),
  ).toBeVisible();
  await expect(page.getByText('Bienvenue dans l’euro.')).toBeVisible();
  await expect(counter(page, 'Argent')).toHaveText(/^0\s€$/);

  const work = page.getByRole('button', { name: /Travailler/ });
  const sleep = page.getByRole('button', { name: /Dormir/ });
  const money = () => amountOf(counter(page, 'Argent'));

  // Ni étude ni sommeil au départ : rien à convertir, aucun cursus.
  await expect(sleep).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Études' })).toBeHidden();

  // Travailler paie, et l'intérim remercie.
  await work.click();
  await expect(page.getByText('Adéquat Intérim vous remercie')).toBeVisible();
  await expect(counter(page, 'Argent')).toHaveText(/^40\s€$/);

  // Seule la prochaine amélioration est proposée : trop chère, au départ.
  const cards = itemOf(page, 'Cartes de visite');
  const stage = itemOf(page, 'Stage « Posture professionnelle »');
  const owned = page.getByRole('region', { name: 'Obtenues', exact: true });
  await page.getByRole('tab', { name: 'Améliorations' }).click();
  await expect(cards.getByRole('button', { name: 'Acheter' })).toBeDisabled();
  await expect(stage).toBeHidden();
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 58,
  );
  await cards.getByRole('button', { name: 'Acheter' }).click();

  // Obtenue, elle quitte la liste d'achat pour celle des améliorations
  // obtenues, et la suivante (le stage) prend sa place.
  await expect(owned.getByText('Cartes de visite')).toBeVisible();
  await expect(stage.getByRole('button', { name: 'Acheter' })).toBeDisabled();
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 150,
  );
  await stage.getByRole('button', { name: 'Acheter' }).click();
  await expect(
    owned.getByText('Stage « Posture professionnelle »'),
  ).toBeVisible();

  // Le cursus apparaît ; étudier coûte de l'argent.
  const course = itemOf(page, 'Posture professionnelle').filter({
    has: page.getByRole('button', { name: 'Étudier' }),
  });
  await expect(page.getByRole('heading', { name: 'Études' })).toBeVisible();
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 20,
  );
  const before = await money();
  await course.getByRole('button', { name: 'Étudier' }).click();
  await expect(page.getByText('Vous avez étudié.')).toBeVisible();
  // L'étude coûte de l'argent (un loyer peut tomber avec elle).
  expect(await money()).toBeLessThan(before);

  // Les marqueurs gagnés se convertissent en points de stat en dormant.
  await repeatUntil(
    async () => {
      await work.click();
    },
    async () => sleep.isEnabled(),
    150,
  );
  const metier = page.getByRole('progressbar', { name: /^Métier/ });
  const gauge = page.getByRole('progressbar', { name: 'Jauge de temps' });
  await expect(metier).toHaveAccessibleName(/palier 0 · 0 pts/);
  const gaugeBefore = Number(await gauge.getAttribute('aria-valuenow'));
  await sleep.click();
  // Dormir fait avancer la jauge de temps (ou passe la période).
  await expect
    .poll(async () => Number(await gauge.getAttribute('aria-valuenow')))
    .not.toBe(gaugeBefore);
  await expect(page.getByText('Vous récupérez.')).toBeVisible();
  await expect(metier).not.toHaveAccessibleName(/palier 0 · 0 pts/);

  // Annuler une amélioration obtenue : elle disparaît, sans remboursement.
  const beforeCancel = await money();
  await owned
    .getByRole('listitem')
    .filter({ hasText: 'Cartes de visite' })
    .getByRole('button', { name: 'Annuler' })
    .click();
  await expect(owned.getByText('Cartes de visite')).toBeHidden();
  expect(await money()).toBe(beforeCancel);
  await expect(cards.getByRole('button', { name: 'Acheter' })).toBeVisible();

  // Le courrier garde les messages reçus ; la comptabilité, les comptes.
  await page.getByRole('tab', { name: 'Courrier' }).click();
  await expect(page.getByText("Bienvenue dans l'euro.").first()).toBeVisible();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('tab', { name: 'Comptabilité' }).click();
  await expect(
    page.getByRole('table', { name: 'Comptes (version simplifiée)' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Recettes' })).toBeVisible();

  // Recommencer la partie : la confirmation protège la vie en cours.
  await page.getByRole('button', { name: 'Recommencer la partie' }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Annuler' })
    .click();
  await expect(owned).toBeVisible();
  await page.getByRole('button', { name: 'Recommencer la partie' }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Recommencer' })
    .click();
  await expect(counter(page, 'Argent')).toHaveText(/^0\s€$/);
  await expect(owned).toBeHidden();
  await expect(page.getByText('Bienvenue dans l’euro.')).toBeVisible();
});
