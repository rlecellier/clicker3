import { expect, test } from '@playwright/test';
import { itemOf, openTab, preloadSave } from './helpers';

test('finance : le surplus se place tout seul, du Livret A au compte-titres', async ({
  page,
}) => {
  // Une marque, riche, à un geste de la fin de la période : le premier travail
  // clôture le mois.
  await preloadSave(page, {
    state: {
      money: 100_000,
      reputationEarned: 200,
      reputation: 100,
      gauge: 69,
    },
  });
  await page.goto('/jeu');

  // Les comptes sont possibles mais fermés : un rendez-vous chez le banquier
  // (au tap) les ouvre. La sidebar annonce les comptes à ouvrir.
  await openTab(page, 'finance');
  await expect(
    page.getByRole('link', { name: /^Finance, 4 nouveautés/ }),
  ).toBeVisible();
  // Chaque compte a son rendez-vous : 2, 3, 4 puis 5 questions, puis un mot de
  // fin qui ouvre le compte.
  const farewells = [
    { questions: 2, farewell: 'Merci.' },
    { questions: 3, farewell: 'Merci, au revoir.' },
    { questions: 4, farewell: 'À bientôt, peut-être.' },
    { questions: 5, farewell: 'Que la bourse soit avec moi.' },
  ];
  for (const { questions, farewell } of farewells) {
    await page
      .getByRole('button', { name: 'Prendre rendez-vous' })
      .first()
      .tap();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    for (let step = 0; step < questions; step++) {
      await dialog.getByRole('button').first().tap();
    }
    await dialog.getByRole('button', { name: farewell }).tap();
    await expect(dialog).toBeHidden();
  }
  await expect(
    page.getByRole('button', { name: 'Prendre rendez-vous' }),
  ).toHaveCount(0);

  // Un tap travaille : la clôture verse le rendement et répartit l'argent.
  await openTab(page, 'vie');
  await page
    .getByRole('button', { name: /^Travailler/ })
    .first()
    .tap();

  await openTab(page, 'finance');
  const savings = itemOf(page, 'Livret A');
  const ldds = itemOf(page, 'Livret de développement durable et solidaire');
  const pel = itemOf(page, 'Plan d’épargne logement');
  const stocks = itemOf(page, 'Compte-titres');

  // Les comptes d'épargne se remplissent dans l'ordre, chacun jusqu'à son
  // plafond fixe ; le reste va au compte-titres, qui n'a pas de plafond.
  await expect(savings.getByText(/^22\s950\s€$/).first()).toBeVisible();
  await expect(ldds.getByText(/^12\s000\s€$/).first()).toBeVisible();
  await expect(pel.getByText(/^61\s200\s€$/).first()).toBeVisible();
  await expect(stocks.getByText(/^\d[\d\s]*\s€$/).first()).toBeVisible();
  await expect(stocks.getByText(/sans plafond/)).toBeVisible();

  // Le total affiché est celui de tous les comptes, et le compte courant reste
  // au matelas (deux mois de dépenses).
  await expect(page.getByText('Total des comptes :')).toBeVisible();
  await expect(page.getByText('Capital placé :')).toContainText(
    /9\d\s\d{3}\s€/,
  );
  await expect(page.getByText('Rendement attendu :')).toContainText(
    /Rendement attendu : [12]\d{2}\s€/,
  );

  // Les comptes ne se manipulent plus à la main.
  await expect(page.getByRole('button', { name: /^Placer/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Retirer/ })).toHaveCount(0);

  // Le rendement apparaît dans les comptes.
  await openTab(page, 'comptes');
  await page.getByRole('tab', { name: 'Cumulé' }).tap();
  await expect(page.getByRole('cell', { name: 'Recettes' })).toBeVisible();
});
