import { expect, test } from '@playwright/test';
import {
  amountOf,
  balanceOf,
  closeBirthday,
  counter,
  expectNoOverflow,
} from './helpers';

const sidebar = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Navigation du jeu' });

test('tranches de vie : commencer enfant, adulte, vieux, puis repartir en Jeunesse', async ({
  page,
}) => {
  // Le titre propose de commencer plus tôt.
  await page.goto('/');
  await expect(
    page.getByText('Ou commencer ailleurs dans la vie :'),
  ).toBeVisible();
  await expectNoOverflow(page);

  // Petite enfance : un seul onglet (et « Recommencer » en pied de sidebar), sans l'en-tête d'argent, et un bouton
  // dont un tap vaut une action avec le gain affiché.
  await page.getByRole('button', { name: /Petite enfance/ }).tap();
  await expect(
    page.getByText('Dans quelle famille naissez-vous ?'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Famille standard' }).tap();
  await expect(page).toHaveURL('/jeu/vie');
  await expect(sidebar(page).getByRole('link')).toHaveCount(2);
  await expect(page.getByLabel('Ressources')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: 'Petite enfance' }),
  ).toBeVisible();
  const awakening = page
    .getByText('Éveil', { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(awakening).toHaveText('0');
  await page.getByRole('button', { name: 'Gazouiller' }).tap();
  await expect(awakening).toHaveText('1');
  await page.getByRole('button', { name: 'Gazouiller' }).tap();
  await expect(awakening).toHaveText('2');
  // Pas d'objet encore : la Maison reste fermée.
  await expect(sidebar(page).getByRole('link')).toHaveCount(2);
  await expectNoOverflow(page);

  // Le nounours arrive à l'éveil 4 : la Maison s'ouvre. On y met « Câliner le
  // nounours » en favori, et il apparaît sur la Vie, où un tap vaut une activité.
  await page.getByRole('button', { name: 'Gazouiller' }).tap();
  await page.getByRole('button', { name: 'Gazouiller' }).tap();
  await expect(awakening).toHaveText('4');
  await expect(sidebar(page).getByRole('link')).toHaveCount(3);
  await sidebar(page).getByRole('link', { name: 'Maison' }).tap();
  await expect(page).toHaveURL('/jeu/maison');
  await expect(page.getByText('Câliner le nounours')).toBeVisible();
  await page.getByRole('button', { name: '☆ Favori' }).first().tap();
  await expect(page.getByRole('button', { name: '★ Retirer' })).toHaveCount(1);
  await sidebar(page).getByRole('link', { name: 'Vie' }).tap();
  const bond = page.getByRole('progressbar', { name: /^Lien : / });
  await expect(bond).toHaveAccessibleName('Lien : Neutre');
  await page.getByRole('button', { name: /Câliner le nounours/ }).tap();
  await expect(bond).toHaveAccessibleName('Lien : Câlin');
  await expect(awakening).toHaveText('5');
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

  // Âge adulte : le jeu complet à 30 ans, avec l'argent et les entreprises du
  // départ. La fenêtre des 30 ans passe avant le jeu, et un tap sur Travailler
  // vaut un gain réel.
  await sidebar(page).getByRole('link', { name: 'Recommencer' }).tap();
  await page.getByRole('button', { name: /^Âge adulte/ }).tap();
  await page.getByRole('button', { name: 'Recommencer' }).tap();
  await closeBirthday(page, '30 ans !');
  await expect(sidebar(page).getByRole('link')).toHaveCount(10);
  const money = counter(page, 'Argent');
  const before = await amountOf(money);
  expect(before).toBe(12_000);
  // Le salaire se compte dans la balance de la période, il est versé en fin de période.
  const balance = await balanceOf(page, 'Argent');
  await page.getByRole('button', { name: /Travailler/ }).tap();
  await expect.poll(() => balanceOf(page, 'Argent')).toBeGreaterThan(balance);
  await expectNoOverflow(page);

  // Vieillesse : pas d'anniversaire à 65 ans, le jeu est jouable aussitôt.
  await sidebar(page).getByRole('link', { name: 'Recommencer' }).tap();
  await page.getByRole('button', { name: /^Vieillesse/ }).tap();
  await page.getByRole('button', { name: 'Recommencer' }).tap();
  await expect(page.getByRole('alertdialog')).toBeHidden();
  await expect(sidebar(page).getByRole('link')).toHaveCount(10);
  await expect(page.getByRole('button', { name: /Travailler/ })).toBeVisible();

  // Jeunesse : le jeu complet, avec tous ses onglets.
  await sidebar(page).getByRole('link', { name: 'Recommencer' }).tap();
  await page.getByRole('link', { name: 'Démarrer ma vie' }).tap();
  await page.getByRole('button', { name: 'Prendre ce poste' }).tap();
  await page.getByRole('button', { name: 'Recommencer' }).tap();
  await closeBirthday(page, 'Joyeux 18e anniversaire !');
  await expect(sidebar(page).getByRole('link')).toHaveCount(10);
  await expect(page.getByLabel('Ressources')).toBeVisible();
});
