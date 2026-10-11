import { expect, test } from '@playwright/test';
import { amountOf, counter, itemOf, preloadSave, repeatUntil } from './helpers';

test('entrepreneur : changer d’emploi, ouvrir un commerce, rupture, production, surplus', async ({
  page,
}) => {
  await preloadSave(page, {
    state: {
      money: 2000,
      stats: { metier: 10, gestion: 10, intelligence: 0, endurance: 0 },
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu');
  await expect(page.getByText('Jeune actif en devenir')).toBeVisible();

  const work = page.getByRole('button', { name: /Travailler/ });
  const sellSurplus = page.getByRole('button', { name: /Vendre le surplus/ });
  const warehouse = page.getByRole('progressbar', { name: /^Entrepôt/ });

  // Le palier de métier ouvre un meilleur poste ; les autres restent fermés.
  const polyvalent = itemOf(page, 'Employé polyvalent');
  const manager = itemOf(page, 'Chargé de mission');
  await expect(manager.getByRole('button', { name: 'Prendre' })).toBeDisabled();
  await polyvalent.getByRole('button', { name: 'Prendre' }).click();
  await expect(polyvalent.getByText('Actuel')).toBeVisible();
  await expect(page.getByText('Salaire : 70')).toBeVisible();

  // Rien à vendre sans stock.
  await expect(sellSurplus).toBeDisabled();

  // Un commerce sans production : à la fin de la période, rupture de stock.
  const shop = itemOf(page, 'Boutique');
  await shop.getByRole('button', { name: 'Acheter' }).click();
  await expect(shop.getByText('1 possédé(s)')).toBeVisible();
  await expect(page.getByText('Entrepreneur (statut déclaré)')).toBeVisible();
  await expect(warehouse).toHaveAccessibleName(/vide/);
  for (let turn = 0; turn < 10; turn += 1) {
    await work.click();
  }
  await expect(warehouse).toHaveAccessibleName(/en rupture/);
  await page.getByRole('tab', { name: 'Courrier' }).click();
  await expect(
    page
      .getByRole('list', { name: 'Courrier' })
      .getByText('Vos clients découvrent la rareté.'),
  ).toBeVisible();

  // Des ateliers produisent plus que la boutique ne vend : le stock se remplit.
  const workshop = itemOf(page, 'Atelier d’assemblage');
  await workshop.getByRole('button', { name: 'Acheter' }).click();
  await workshop.getByRole('button', { name: 'Acheter' }).click();
  await expect(workshop.getByText('2 possédé(s)')).toBeVisible();
  const stock = () => amountOf(counter(page, 'Stock'));
  await repeatUntil(
    () => work.click(),
    async () => (await stock()) > 0,
  );

  // Vendre le surplus vide l'entrepôt contre quelques euros.
  const moneyBefore = await amountOf(counter(page, 'Argent'));
  await expect(sellSurplus).toBeEnabled();
  await sellSurplus.click();
  await expect(page.getByText('Surplus liquidé.')).toBeVisible();
  expect(await stock()).toBe(0);
  expect(await amountOf(counter(page, 'Argent'))).toBeGreaterThan(moneyBefore);
  await expect(sellSurplus).toBeDisabled();
});
