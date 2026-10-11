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

  // Le stage est trop cher tant qu'on n'a pas travaillé assez.
  const stage = itemOf(page, 'Stage « Posture professionnelle »');
  await page.getByRole('tab', { name: 'Améliorations' }).click();
  await expect(stage.getByRole('button', { name: 'Acheter' })).toBeDisabled();
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 150,
  );
  await stage.getByRole('button', { name: 'Acheter' }).click();
  await expect(
    stage.getByText('Acheté', { exact: true }).first(),
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
  expect(await money()).toBe(before - 20);

  // Les marqueurs gagnés se convertissent en points de stat en dormant.
  await repeatUntil(
    async () => {
      await work.click();
    },
    async () => sleep.isEnabled(),
    150,
  );
  const metier = page.getByRole('progressbar', { name: /^Métier/ });
  await expect(metier).toHaveAccessibleName(/palier 0 · 0 pts/);
  await sleep.click();
  await expect(page.getByText('Vous récupérez.')).toBeVisible();
  await expect(metier).not.toHaveAccessibleName(/palier 0 · 0 pts/);

  // Les cartes de visite : un petit achat de plus pour la réputation.
  const cards = itemOf(page, 'Cartes de visite');
  await repeatUntil(
    () => work.click(),
    async () => cards.getByRole('button', { name: 'Acheter' }).isEnabled(),
    150,
  );
  await cards.getByRole('button', { name: 'Acheter' }).click();
  await expect(
    cards.getByText('Acheté', { exact: true }).first(),
  ).toBeVisible();

  // Le courrier garde les messages reçus ; la comptabilité, les comptes.
  await page.getByRole('tab', { name: 'Courrier' }).click();
  await expect(page.getByText("Bienvenue dans l'euro.").first()).toBeVisible();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('tab', { name: 'Comptabilité' }).click();
  await expect(
    page.getByRole('table', { name: 'Comptes (version simplifiée)' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Recettes' })).toBeVisible();
});
