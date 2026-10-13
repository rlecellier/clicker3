import { expect, test } from '@playwright/test';
import { companies, economyRules, startState, upgrades } from '@game/data';
import {
  expectNoOverflow,
  amountOf,
  balanceOf,
  numberOf,
  counter,
  itemOf,
  longPress,
  openTab,
  preloadSave,
} from './helpers';

// On possède déjà les améliorations hors parcours, pour n'acheter que celles du
// parcours, dans l'ordre des prix. Celles qui ajoutent un loyer ou des salaires
// en sont exclues : la balance de la période reste sous 1 000 €, affichée à
// l'euro près, pour lire le gain exact d'un clic. Le premier collaborateur,
// acheté pendant le parcours, ajoute pourtant son salaire aux dépenses fixes :
// des salaires déjà gagnés ramènent la balance de départ à -950 €.
const hire = upgrades.find((upgrade) => upgrade.id === 'premier-collaborateur');
// L'atelier possédé paie aussi la mensualité de son crédit (charges).
const workshop = companies.find((company) => company.id === 'atelier');
const fixedExpenses =
  startState.rent +
  economyRules.baseLivingCost +
  (workshop?.charges ?? 0) +
  (hire?.payroll ?? 0);
const startBalance = -950;
const journey = new Set([
  'premier-collaborateur',
  'tableau-de-bord',
  'procedure-travail',
]);

test('patron : premier collaborateur, travail automatique, tableau de bord', async ({
  page,
}) => {
  await page.clock.install();
  await preloadSave(page, {
    state: {
      money: 2_000_000,
      companies: { atelier: 1 },
      phase: 'entrepreneur',
      wagesDue: { interim: fixedExpenses + startBalance },
      // La procédure de travail demande Métier, Gestion et Intelligence au
      // dernier niveau et Endurance 7 : seul le cursus d'Endurance reste utile.
      stats: { metier: 700, gestion: 700, intelligence: 700, endurance: 350 },
      upgrades: upgrades
        .filter(
          (upgrade) =>
            !journey.has(upgrade.id) &&
            upgrade.rent === undefined &&
            upgrade.payroll === undefined,
        )
        .map((upgrade) => upgrade.id),
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu/vie');

  // La sauvegarde possède déjà la dernière amélioration : la pop-up « jusqu'au
  // bout » s'ouvre une fois, et se ferme d'un appui.
  const finale = page.getByRole('alertdialog', { name: 'Jusqu’au bout' });
  await expect(finale).toContainText('2 000 000 000');
  const closeFinale = () =>
    finale.getByRole('button', { name: 'Merci, la direction' }).tap();
  await closeFinale();
  await expect(finale).toBeHidden();
  await page.reload();
  await expect(page).toHaveURL('/jeu/vie');
  await expect(finale).toBeHidden();

  const work = page.getByRole('button', { name: /Travailler/ });
  const workOn = page.getByText('Appui long : couper l’automatique');
  const openUpgrades = async () => {
    await openTab(page, 'ameliorations');
  };

  // Sans amélioration d'automatisation, aucun appui long ne s'annonce.
  await expect(page.getByText(/Appui long/)).toBeHidden();

  // La flèche d'Étudier ne propose que les cursus dont la compétence peut
  // encore progresser.
  await page.getByRole('button', { name: 'Choisir le cursus' }).click();
  const courseMenu = page.getByRole('menuitemradio');
  await expect(courseMenu).toHaveCount(1);
  await expect(courseMenu.filter({ hasText: /Dépassement/ })).toHaveCount(1);

  // La mini-jauge sous « Étudier » suit le cursus choisi.
  await page.keyboard.press('Escape');
  const miniGauge = (stat: string) =>
    page.getByRole('progressbar', { name: new RegExp(`^${stat} · palier`) });
  await expect(miniGauge('Endurance')).toBeVisible();
  await expect(miniGauge('Métier')).toBeHidden();

  // Le premier collaborateur fait de vous un dirigeant ; il touche les
  // entreprises, donc il s'achète depuis Entreprises.
  await openTab(page, 'entreprises');
  await page.getByRole('tab', { name: 'Améliorations' }).click();
  await itemOf(page, 'Premier collaborateur')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await openTab(page, 'vie');
  await expect(
    page.getByText('Dirigeant (sans équipe de direction)'),
  ).toBeVisible();

  // Le tableau de bord remplace les comptes simplifiés.
  await openTab(page, 'comptes');
  await expect(
    page.getByRole('table', { name: 'Comptes (version simplifiée)' }),
  ).toBeVisible();
  await openUpgrades();
  await itemOf(page, 'Tableau de bord')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await openTab(page, 'comptes');
  await expect(
    page.getByRole('heading', { name: 'D’où vient l’argent ?' }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Vente du surplus' }).first(),
  ).toBeVisible();

  // Le stock et les entreprises ont leur section ; on lit le cumul puis
  // on revient à la période en cours.
  await expect(
    page.getByRole('heading', { name: 'Comment le stock a-t-il bougé ?' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: /^Entrées/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Cumulé' }).click();
  await expect(page.getByText('Depuis le début de la partie')).toBeVisible();
  await page.getByRole('tab', { name: 'Période en cours' }).click();
  await expect(page.getByText(/^Période de /)).toBeVisible();
  await expectNoOverflow(page);

  // Maintenir Travailler répète l'action à 4 clics par seconde : bien plus
  // qu'un clic seul, et plus rien une fois le doigt levé.
  await openTab(page, 'vie');
  const money = () => amountOf(counter(page, 'Argent'));
  const balance = () => balanceOf(page, 'Argent');
  // Argent et balance ensemble : l'automatisme agit sur l'un ou l'autre selon
  // qu'une période se termine.
  const snapshot = async () => `${await money()}|${await balance()}`;
  // Un tap sur écran tactile vaut un seul clic, pas deux : il rapporte
  // exactement ce que le bouton annonce, dans la balance de la période.
  const announcement = page.getByText(/Rapporte \d/);
  await expect(announcement).toBeVisible();
  const announced = numberOf((await announcement.textContent()) ?? undefined);
  expect(announced).toBeGreaterThan(0);
  const cashBeforeClick = await money();
  const beforeClick = await balance();
  await work.tap();
  const oneClick = (await balance()) - beforeClick;
  expect(oneClick).toBe(announced);
  expect(await money()).toBe(cashBeforeClick);
  const beforeHold = await balance();
  await work.hover();
  await page.mouse.down();
  // Un clic à l'appui, puis un toutes les 250 ms : trois en 600 ms. Plus, la
  // période se terminerait et la balance repartirait de zéro.
  await page.clock.runFor(600);
  await page.mouse.up();
  const afterHold = await balance();
  expect(afterHold - beforeHold).toBeGreaterThanOrEqual(oneClick * 3);
  await page.clock.runFor(2000);
  expect(await balance()).toBe(afterHold);

  // L'automatisation s'achète, coupée au départ.
  await openUpgrades();
  // Un coup de pouce s'achète pour quelques mois : il devient actif.
  const ginkgo = itemOf(page, 'Cure de ginkgo biloba');
  await ginkgo.getByRole('button', { name: 'Acheter' }).click();
  await expect(ginkgo.getByText(/Actif, encore/)).toBeVisible();
  await itemOf(page, 'Procédure de travail')
    .getByRole('button', { name: 'Acheter' })
    .click();
  await openTab(page, 'vie');
  await expect(page.getByText('Appui long : automatique')).toHaveCount(1);

  // Un appui long sur Travailler l'active sans interrompre la répétition ;
  // le clic qui suit le relâchement ne compte pas comme un travail de plus.
  await longPress(page, work);
  await expect(workOn).toBeVisible();
  const afterLongPress = await snapshot();
  await page.clock.runFor(1000);
  await expect.poll(snapshot).not.toBe(afterLongPress);

  // Un second appui long le coupe.
  await longPress(page, work);
  await expect(workOn).toBeHidden();
  const stopped = await snapshot();
  await page.clock.runFor(20_000);
  expect(await snapshot()).toBe(stopped);

  // Quand tout est au dernier palier, « Étudier » disparaît sans que les
  // autres boutons bougent ; le raccourci E ne fait plus rien.
  const sellSurplus = page.getByRole('button', { name: /Vendre le surplus/ });
  const boxes = async () => [
    await work.boundingBox(),
    await sellSurplus.boundingBox(),
  ];
  // La page défile (fenêtre des balances au-dessus) : on mesure depuis le haut.
  await page.getByRole('main').evaluate((main) => {
    main.scrollTop = 0;
  });
  const boxesBefore = await boxes();
  await preloadSave(page, {
    state: {
      money: 100_000,
      phase: 'entrepreneur',
      stats: { metier: 700, gestion: 700, intelligence: 700, endurance: 700 },
      upgrades: upgrades.map((upgrade) => upgrade.id),
    },
  });
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu/vie');
  await closeFinale();
  await expect(page.getByRole('button', { name: 'Étudier' })).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Choisir le cursus' }),
  ).toBeHidden();
  expect(await boxes()).toEqual(boxesBefore);
  const richMoney = await money();
  await page.keyboard.press('e');
  expect(await money()).toBe(richMoney);
});
