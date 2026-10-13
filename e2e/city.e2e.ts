import { expect, test } from '@playwright/test';
import { expectNoOverflow, itemOf, openTab, preloadSave } from './helpers';

test('ville : débloquer des quartiers avec la réputation, lire la carte', async ({
  page,
}) => {
  await preloadSave(page, {
    state: {
      reputation: 60,
      reputationEarned: 110,
      companies: { atelier: 1, boutique: 1 },
      phase: 'entrepreneur',
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu/vie');

  // Un quartier se débloque avec de la réputation, depuis l'onglet Entreprises.
  await openTab(page, 'entreprises');
  await page.getByRole('tab', { name: /^Quartiers/ }).click();
  const hauts = itemOf(page, 'Les Hauts-Fourneaux');
  await expect(
    itemOf(page, 'Les Tilleuls').getByText('Ouvert').first(),
  ).toBeVisible();
  await expect(
    itemOf(page, 'Le Pôle d’Excellence').getByRole('button', {
      name: 'Débloquer',
    }),
  ).toBeDisabled();
  await hauts.getByRole('button', { name: 'Débloquer' }).click();
  await expect(hauts.getByRole('button', { name: 'Ouvert' })).toBeDisabled();

  // La carte montre les quartiers, les bâtiments et les indicateurs.
  await openTab(page, 'ville');
  await expect(
    page.getByRole('group', { name: 'Plan de la ville' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Les Hauts-Fourneaux' }),
  ).toBeVisible();
  await expect(page.locator('title', { hasText: 'Boutique (1)' })).toHaveCount(
    1,
  );
  await expect(
    page.locator('title', { hasText: 'Atelier d’assemblage (1)' }),
  ).toHaveCount(1);
  await expect(
    page.getByRole('progressbar', { name: /^Pollution/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: /^Inégalités/ }).first(),
  ).toBeVisible();
  await expectNoOverflow(page);

  // Un quartier verrouillé se débloque depuis sa fiche.
  await page
    .getByRole('button', { name: 'Parc d’activités Horizon (verrouillé)' })
    .click();
  const sheet = page.getByRole('region', {
    name: 'Fiche : Parc d’activités Horizon',
  });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: 'Débloquer' }).click();
  await expect(sheet.getByRole('button', { name: 'Ouvert' })).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Parc d’activités Horizon' }),
  ).toBeVisible();

  // La réputation manque pour le dernier quartier, la fiche dit pourquoi.
  await page
    .getByRole('button', { name: 'Le Pôle d’Excellence (verrouillé)' })
    .click();
  const last = page.getByRole('region', {
    name: 'Fiche : Le Pôle d’Excellence',
  });
  await expect(last.getByRole('button', { name: 'Débloquer' })).toBeDisabled();

  // Retour à la vie.
  await openTab(page, 'vie');
});
