import { expect, test } from '@playwright/test';
import { itemOf, openTab, preloadSave } from './helpers';

test('finance : placer son argent, toucher le rendement, le reprendre', async ({
  page,
}) => {
  // Acteur majeur, à un geste de la fin de la période : le premier travail
  // clôture le mois.
  await preloadSave(page, {
    state: {
      money: 100_000,
      reputationEarned: 100,
      reputation: 100,
      gauge: 69,
    },
  });
  await page.goto('/jeu');

  await openTab(page, 'finance');
  const savings = itemOf(page, 'Compte épargne optimisée');
  const stocks = itemOf(page, 'Portefeuille de valeur actionnariale');
  await expect(
    savings.getByRole('button', { name: 'Placer tout' }),
  ).toBeEnabled();

  // Un tap place la moitié de ce que le plafond permet : une seule action.
  await savings.getByRole('button', { name: 'Placer la moitié' }).tap();
  await expect(savings.getByText('10 000 €').first()).toBeVisible();
  await expect(page.getByText('Capital placé :')).toContainText('10 000 €');

  // Les titres se placent aussi, jusqu'au plafond ou à la dernière pièce.
  await stocks.getByRole('button', { name: 'Placer la moitié' }).tap();
  await expect(stocks.getByText('10 000 €').first()).toBeVisible();

  // Le rendement attendu suit le capital : 0,3 % de l'épargne, 0,8 % des titres.
  await expect(page.getByText('Rendement attendu :')).toContainText('110 €');

  // La période passe : le rendement tombe sur le compte courant.
  await openTab(page, 'vie');
  await page
    .getByRole('button', { name: /^Travailler/ })
    .first()
    .tap();
  await openTab(page, 'comptes');
  await page.getByRole('tab', { name: 'Cumulé' }).tap();
  await expect(page.getByRole('cell', { name: 'Recettes' })).toBeVisible();

  // Le capital se reprend à tout moment.
  await openTab(page, 'finance');
  await savings.getByRole('button', { name: 'Retirer tout' }).tap();
  await expect(page.getByText('Capital placé :')).not.toContainText('30 000');
  await expect(
    savings.getByRole('button', { name: 'Retirer tout' }),
  ).toBeDisabled();
});
