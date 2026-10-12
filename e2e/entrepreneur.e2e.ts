import { expect, test } from '@playwright/test';
import {
  amountOf,
  counter,
  expectNoOverflow,
  itemOf,
  openTab,
  preloadSave,
  repeatUntil,
} from './helpers';

test('entrepreneur : changer d’emploi, ouvrir un commerce, rupture, production, surplus', async ({
  page,
}) => {
  await preloadSave(page, {
    state: {
      money: 4000,
      stats: { metier: 10, gestion: 10, intelligence: 0, endurance: 0 },
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu/vie');
  await expect(page.getByText('Jeune actif en devenir')).toBeVisible();

  const work = page.getByRole('button', { name: /Travailler/ });
  const sellSurplus = page.getByRole('button', { name: /Vendre le surplus/ });
  const warehouse = page.getByRole('progressbar', { name: /^Entrepôt/ });

  // Les déblocages de la partie chargée s'annoncent sur les onglets concernés,
  // et la visite d'un onglet éteint son badge.
  const sidebar = page.getByRole('navigation', { name: 'Navigation du jeu' });
  const investLink = sidebar.getByRole('link', { name: /^Investir/ });
  const jobsLink = sidebar.getByRole('link', { name: /^Emploi/ });
  await expect(investLink).toHaveAccessibleName(/^Investir, \d+ nouveautés?$/);
  await expect(jobsLink).toHaveAccessibleName('Emploi, 1 nouveauté');

  // Le palier de métier ouvre un meilleur poste ; les autres restent fermés.
  await openTab(page, 'emploi');
  await expect(jobsLink).toHaveAccessibleName('Emploi');
  const polyvalent = itemOf(page, 'Employé polyvalent');
  const manager = itemOf(page, 'Chargé de mission');
  await expect(manager.getByRole('button', { name: 'Prendre' })).toBeDisabled();
  await polyvalent.getByRole('button', { name: 'Prendre' }).click();
  await expect(polyvalent.getByText('Actuel')).toBeVisible();

  // Le nouveau salaire s'affiche sur l'action ; rien à vendre sans stock.
  await openTab(page, 'vie');
  await expect(page.getByText('Rapporte 76')).toBeVisible();
  await expect(sellSurplus).toBeDisabled();

  // Un commerce sans production : à la fin de la période, rupture de stock.
  // Les raccourcis clavier ouvrent l'onglet (5) et travaillent (T) de partout.
  await page.keyboard.press('5');
  await expect(page).toHaveURL('/jeu/investir');
  await expect(investLink).toHaveAccessibleName('Investir');
  const shop = itemOf(page, 'Boutique');
  await shop.getByRole('button', { name: 'Acheter' }).click();
  await expect(shop.getByText('1 possédé(s)')).toBeVisible();
  await expect(warehouse).toHaveAccessibleName(/vide/);
  await page.keyboard.press('2');
  await expect(page).toHaveURL('/jeu/vie');
  const money = () => amountOf(counter(page, 'Argent'));
  const moneyBeforeKey = await money();
  await page.keyboard.press('5');
  await page.keyboard.press('t');
  await page.keyboard.press('2');
  await expect.poll(money).toBeGreaterThan(moneyBeforeKey);
  await expect(page.getByText('Entrepreneur (statut déclaré)')).toBeVisible();
  for (let turn = 0; turn < 10; turn += 1) {
    await work.click();
  }
  // Le message arrive dans une popup hors flux : elle ne masque pas
  // « Travailler », le jeu continue (le clic passe), et elle ne marque rien
  // comme lu.
  const popup = page.getByRole('status').filter({ hasText: 'Nouveau message' });
  await expect(popup).toContainText('Vos clients découvrent la rareté.');
  const workBox = await work.boundingBox();
  const popupBox = await popup.boundingBox();
  expect(workBox !== null && popupBox !== null).toBe(true);
  expect((workBox?.y ?? 0) + (workBox?.height ?? 0)).toBeLessThanOrEqual(
    popupBox?.y ?? 0,
  );
  await work.click();
  expect(await work.boundingBox()).toEqual(workBox);
  await expectNoOverflow(page);
  await popup.getByRole('button', { name: 'Fermer' }).click();
  await expect(popup).toBeHidden();
  await openTab(page, 'investir');
  await expect(warehouse).toHaveAccessibleName(/en rupture/);
  // Le message arrivé en jouant s'annonce par un badge, qui se vide à la visite.
  const mailLink = page
    .getByRole('navigation', { name: 'Navigation du jeu' })
    .getByRole('link', { name: /^Courrier/ });
  await expect(mailLink).toHaveAccessibleName(
    /^Courrier, \d+ messages? non lus?$/,
  );
  await openTab(page, 'courrier');
  await expect(mailLink).toHaveAccessibleName('Courrier');
  await expect(
    page
      .getByRole('list', { name: 'Courrier' })
      .getByText('Vos clients découvrent la rareté.'),
  ).toBeVisible();

  // Les comptes se lisent période par période : une période terminée
  // remplace la période en cours, sans rien faire déborder.
  await openTab(page, 'comptes');
  await expect(page.getByText(/^Période de /)).toBeVisible();
  await page.getByRole('tab', { name: 'Il y a 1 mois' }).click();
  await expect(
    page.getByRole('tab', { name: 'Il y a 1 mois' }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('cell', { name: 'Recettes' })).toBeVisible();
  await expectNoOverflow(page);

  // Des ateliers produisent plus que la boutique ne vend : le stock se remplit.
  await openTab(page, 'investir');
  const workshop = itemOf(page, 'Atelier d’assemblage');
  await workshop.getByRole('button', { name: 'Acheter' }).click();
  await workshop.getByRole('button', { name: 'Acheter' }).click();
  await expect(workshop.getByText('2 possédé(s)')).toBeVisible();
  await openTab(page, 'vie');
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

  // Un petit entrepôt agrandit le stock, sans condition : l'issue de secours.
  await openTab(page, 'investir');
  const smallWarehouse = itemOf(page, 'Petit entrepôt');
  await expect(warehouse).toHaveAccessibleName(/ 50\)/);
  await smallWarehouse.getByRole('button', { name: 'Acheter' }).click();
  await expect(smallWarehouse.getByText('1 possédé(s)')).toBeVisible();
  await expect(warehouse).toHaveAccessibleName(/ 75\)/);

  // Le post-it « prochain achat » mène à la ligne de l'amélioration, mise en
  // évidence ; l'achat la retire de la liste. Le lien marche aussi en direct.
  await openTab(page, 'vie');
  await page
    .getByRole('link', { name: /Prochain achat : Cartes de visite/ })
    .click();
  await expect(page).toHaveURL(/\/jeu\/investir\?amelioration=cartes-visite$/);
  const cards = itemOf(page, 'Cartes de visite');
  await expect(cards).toBeInViewport();
  await expect(cards).toHaveClass(/highlighted/);
  await cards.getByRole('button', { name: 'Acheter' }).click();
  await expect(cards).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole('tab', { name: 'Améliorations' }),
  ).toHaveAttribute('aria-selected', 'true');

  // Les chiffres de l'écran Investir sont les valeurs finales : acheter un
  // bonus de production change la production affichée, avant et après l'achat.
  const collaborator = itemOf(page, 'Premier collaborateur');
  await expect(collaborator).toContainText(
    'Production de toutes les entreprises +110 %',
  );
  await expect(collaborator).toContainText(
    'Production : 4 → 8 articles par période',
  );
  await collaborator.getByRole('button', { name: 'Acheter' }).click();
  await expect(collaborator).toBeHidden();
  await page.getByRole('tab', { name: 'Entreprises' }).click();
  await expect(page.locator('#item-atelier')).toContainText(
    '8 articles par période (2 × 4,2)',
  );
});
