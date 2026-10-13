import { expect, test } from '@playwright/test';
import { companies, jobs, upgrades } from '@game/data';
import {
  amountOf,
  balanceOf,
  clickThroughPromotion,
  counter,
  expectNoOverflow,
  itemOf,
  openTab,
  preloadSave,
  repeatUntil,
} from './helpers';

// Débits lus dans les données : le test suit le recalage de l'équilibrage.
const workshop = companies.find((company) => company.id === 'atelier');
const workshopOutput = workshop?.kind === 'production' ? workshop.output : 0;
// Assez de place pour deux ateliers : sans cela l'achat resterait grisé.
const roomForWorkshops = 1000;

test('entrepreneur : changer d’emploi, ouvrir un commerce, rupture, production, surplus', async ({
  page,
}) => {
  await preloadSave(page, {
    state: {
      money: 5_000_000,
      stockCapacity: roomForWorkshops,
      stats: { metier: 10, gestion: 15, intelligence: 0, endurance: 0 },
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
  const companiesLink = sidebar.getByRole('link', { name: /^Entreprises/ });
  const jobsLink = sidebar.getByRole('link', { name: /^Emploi/ });
  await expect(companiesLink).toHaveAccessibleName(
    /^Entreprises, \d+ nouveautés?$/,
  );
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
  // (le salaire du polyvalent, 25 % de plus s'il est déjà en heures supplémentaires).
  const polyvalentWage =
    jobs.find((job) => job.id === 'polyvalent')?.salary ?? 0;
  const announcedWage = new RegExp(
    `Rapporte (${polyvalentWage}|${Math.round(polyvalentWage * 1.25)})`,
  );
  await expect(page.getByText(announcedWage)).toBeVisible();
  await expect(sellSurplus).toBeDisabled();

  // Un commerce sans production : à la fin de la période, rupture de stock.
  // Les raccourcis clavier ouvrent l'onglet (5) et travaillent (T) de partout.
  await page.keyboard.press('5');
  await expect(page).toHaveURL('/jeu/entreprises');
  await expect(companiesLink).toHaveAccessibleName('Entreprises');
  const shop = itemOf(page, 'Boutique');
  await shop.getByRole('button', { name: 'Acheter' }).click();
  await expect(shop.getByText('1 possédé(s)')).toBeVisible();
  await expect(warehouse).toHaveAccessibleName(/vide/);
  await page.keyboard.press('2');
  await expect(page).toHaveURL('/jeu/vie');
  // Le raccourci T travaille de partout : le salaire fait monter la balance
  // de la période, il n'est versé qu'à la clôture.
  const balance = () => balanceOf(page, 'Argent');
  const balanceBeforeKey = await balance();
  await page.keyboard.press('5');
  await page.keyboard.press('t');
  await page.keyboard.press('2');
  // La balance (charges de la boutique comprises) dépasse 1 000 € : elle est
  // abrégée à 100 € près (« −1,1 k »), d'où la marge.
  const tolerance = 100;
  await expect
    .poll(balance)
    .toBeGreaterThanOrEqual(balanceBeforeKey + polyvalentWage - tolerance);
  expect(await balance()).toBeLessThanOrEqual(
    balanceBeforeKey + Math.round(polyvalentWage * 1.25) + tolerance,
  );
  await expect(page.getByText('Entrepreneur (statut déclaré)')).toBeVisible();
  for (let turn = 0; turn < 10; turn += 1) {
    await clickThroughPromotion(page, work);
  }
  await work.click();
  await expectNoOverflow(page);
  await openTab(page, 'entreprises');
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
      .getByText('Vos clients découvrent la rareté.')
      // Les heures sup. raccourcissent les périodes : la rupture a pu se répéter.
      .first(),
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
  await openTab(page, 'entreprises');
  const workshop = itemOf(page, 'Atelier d’assemblage');
  await workshop.getByRole('button', { name: 'Acheter' }).click();
  await workshop.getByRole('button', { name: 'Acheter' }).click();
  await expect(workshop.getByText('2 possédé(s)')).toBeVisible();

  // La comptabilité des entreprises liste ce qu'on possède ; la barre de
  // stock mène au détail dans Comptes.
  await page.getByRole('tab', { name: 'Comptabilité' }).click();
  await expect(
    page.getByRole('row', { name: /Atelier d’assemblage/ }),
  ).toBeVisible();
  await expect(page.getByRole('row', { name: /Boutique/ })).toBeVisible();
  await page.getByRole('link', { name: 'Détail du stock' }).click();
  await expect(page).toHaveURL(/\/jeu\/comptes#stock$/);
  await openTab(page, 'vie');
  const stock = () => amountOf(counter(page, 'Stock'));
  await repeatUntil(
    () => clickThroughPromotion(page, work),
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
  await openTab(page, 'entreprises');
  const smallWarehouse = itemOf(page, 'Petit entrepôt');
  await expect(warehouse).toHaveAccessibleName(/ 1\D?000\)/);
  await smallWarehouse.getByRole('button', { name: 'Acheter' }).click();
  await expect(smallWarehouse.getByText('1 possédé(s)')).toBeVisible();
  // La capacité se recalcule des petits entrepôts : 50 + un petit entrepôt.
  await expect(warehouse).toHaveAccessibleName(/ \d+\)/);

  // Le lien vers une amélioration (le post-it « prochain achat » du bureau)
  // mène à sa ligne, mise en évidence ; l'achat la retire de la liste.
  await page.goto('/jeu/ameliorations?amelioration=cartes-visite');
  await expect(page).toHaveURL(
    /\/jeu\/ameliorations\?amelioration=cartes-visite$/,
  );
  const cards = itemOf(page, 'Cartes de visite');
  await expect(cards).toBeInViewport();
  await expect(cards).toHaveClass(/highlighted/);
  await cards.getByRole('button', { name: 'Acheter' }).click();
  await expect(cards).toBeHidden();
  await page.reload();
  await expect(page.getByRole('tab', { name: 'À acheter' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  // Les chiffres de l'écran Améliorations sont les valeurs finales : acheter un
  // bonus de production change la production affichée, avant et après l'achat.
  const collaborator = itemOf(page, 'Premier collaborateur');
  const hireBonus =
    upgrades
      .find((upgrade) => upgrade.id === 'premier-collaborateur')
      ?.effects.find((effect) => effect.type === 'productionBonus')?.bonus ?? 0;
  const before = (2 * workshopOutput).toLocaleString('fr-FR');
  const produced = Math.round(2 * workshopOutput * (1 + hireBonus));
  const perCopy = (workshopOutput * (1 + hireBonus)).toLocaleString('fr-FR', {
    maximumFractionDigits: 1,
  });
  await expect(collaborator).toContainText(
    `Production de toutes les entreprises +${Math.round(hireBonus * 100)} %`,
  );
  await expect(collaborator).toContainText(
    `Production : ${before} → ${produced.toLocaleString('fr-FR')} articles par période`,
  );
  await collaborator.getByRole('button', { name: 'Acheter' }).click();
  await expect(collaborator).toBeHidden();
  await openTab(page, 'entreprises');
  await expect(page.locator('#item-atelier')).toContainText(
    `${produced.toLocaleString('fr-FR')} articles par période (2 × ${perCopy})`,
  );
});
