import { expect, test } from '@playwright/test';
import { closeBirthday, expectNoOverflow } from './helpers';

const sidebar = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Navigation du jeu' });

test('tranches de vie : commencer enfant, grandir, puis repartir en Jeunesse', async ({
  page,
}) => {
  // Le titre propose de commencer plus tôt.
  await page.goto('/');
  await expect(page.getByText('Ou commencer plus tôt :')).toBeVisible();
  await expectNoOverflow(page);

  // Petite enfance : un seul onglet (et « Recommencer » en pied de sidebar), sans l'en-tête d'argent, et un bouton
  // dont un tap vaut une action avec le gain affiché.
  await page.getByRole('button', { name: /Petite enfance/ }).tap();
  await expect(page).toHaveURL('/jeu/vie');
  await expect(sidebar(page).getByRole('link')).toHaveCount(2);
  await expect(page.getByLabel('Ressources')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: 'Petite enfance' }),
  ).toBeVisible();
  const counter = page
    .getByText('Éveil', { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(counter).toHaveText('0');
  await page.getByRole('button', { name: 'Gazouiller' }).tap();
  await expect(counter).toHaveText('1');
  await page.getByRole('button', { name: 'Gazouiller' }).tap();
  await expect(counter).toHaveText('2');
  await expectNoOverflow(page);

  // Un onglet du jeu complet renvoie à la Vie.
  await page.goto('/jeu/emploi');
  await expect(page).toHaveURL('/jeu/vie');

  // « Recommencer » ramène au titre : commencer l'Enfance par-dessus la vie en
  // cours demande confirmation, puis le compteur repart de zéro.
  await sidebar(page).getByRole('link', { name: 'Recommencer' }).tap();
  await expect(page).toHaveURL('/');
  await page.getByRole('button', { name: /^Enfance/ }).tap();
  await page.getByRole('button', { name: 'Recommencer' }).tap();
  await expect(page.getByRole('heading', { name: 'Enfance' })).toBeVisible();
  await expect(
    page
      .getByText('Curiosité', { exact: true })
      .locator('xpath=following-sibling::dd[1]'),
  ).toHaveText('0');

  // Jeunesse : le jeu complet, avec tous ses onglets.
  await sidebar(page).getByRole('link', { name: 'Recommencer' }).tap();
  await page.getByRole('link', { name: 'Démarrer ma vie' }).tap();
  await page.getByRole('button', { name: 'Prendre ce poste' }).tap();
  await page.getByRole('button', { name: 'Recommencer' }).tap();
  await closeBirthday(page, 'Joyeux 18e anniversaire !');
  await expect(sidebar(page).getByRole('link')).toHaveCount(10);
  await expect(page.getByLabel('Ressources')).toBeVisible();
});
