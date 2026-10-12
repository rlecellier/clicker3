import { expect, test } from '@playwright/test';
import { startState } from '@game/data';
import {
  SAVE_KEY,
  amountOf,
  balanceOf,
  counter,
  itemOf,
  openTab,
  repeatUntil,
} from './helpers';

test('début de carrière : travailler, acheter un stage, étudier, s’endormir', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Démarrer ma vie' }).click();
  await expect(page).toHaveURL('/nouvelle-vie');
  await expect(
    page.getByRole('heading', { name: 'Votre premier emploi' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await expect(page).toHaveURL('/jeu/vie');
  await expect(
    page.getByRole('heading', { name: 'Camille Morel' }),
  ).toBeVisible();
  await expect(page.getByText('Bienvenue dans l’euro.')).toBeVisible();
  await expect(counter(page, 'Argent')).toHaveText(/^0\s€$/);

  const work = page.getByRole('button', { name: /Travailler/ });
  const money = () => amountOf(counter(page, 'Argent'));

  // Hauteurs stables : le bouton Travailler ne bouge ni quand le message
  // d'accueil laisse place au retour d'action, ni quand « Étudier » apparaît.
  const workBox = async () => {
    const box = await work.boundingBox();
    expect(box).not.toBeNull();
    return box;
  };
  const workBoxAtStart = await workBox();

  // Aucun cursus au départ.
  await expect(page.getByRole('heading', { name: 'Études' })).toBeHidden();

  // Travailler ne paie pas tout de suite : le salaire est versé à la fin de la
  // période. Il fait monter la balance (le loyer est déjà à payer), pas
  // l'argent.
  const rentBalance = await balanceOf(page, 'Argent');
  expect(rentBalance).toBeLessThan(0);
  await work.click();
  await expect(page.getByText('Adéquat Intérim vous remercie')).toBeVisible();
  expect(await workBox()).toEqual(workBoxAtStart);
  await expect(counter(page, 'Argent')).toHaveText(/^0\s€$/);
  // Un peu plus de 60 : la dette à venir porte moins d'intérêts.
  expect(await balanceOf(page, 'Argent')).toBeGreaterThanOrEqual(
    rentBalance + 60,
  );

  // Jusqu'à une balance positive : à la clôture, l'argent monte de la balance.
  await repeatUntil(
    () => work.click(),
    async () => (await balanceOf(page, 'Argent')) > 0,
  );
  const announcedGain = await balanceOf(page, 'Argent');
  await repeatUntil(
    () => work.click(),
    async () => (await money()) > 0,
  );
  expect(await money()).toBeGreaterThanOrEqual(announcedGain);

  // Les améliorations disponibles sont toutes listées, même trop chères ; un
  // seul salaire suffit aux cartes de visite, pas au stage.
  const cards = itemOf(page, 'Cartes de visite');
  const stage = itemOf(page, 'Stage « Posture professionnelle »');
  const owned = page.getByRole('region', { name: 'Obtenues', exact: true });
  const openUpgrades = async () => {
    await openTab(page, 'investir');
    await page.getByRole('tab', { name: 'Améliorations' }).click();
  };
  const openOwned = async () => {
    await openTab(page, 'investir');
    await page.getByRole('tab', { name: 'Obtenues' }).click();
  };
  const cashAtCards = await money();
  await openUpgrades();
  // L'en-tête fixe garde l'argent visible hors de l'onglet Vie.
  await expect(counter(page, 'Argent')).toHaveText(
    new RegExp(String.raw`^${cashAtCards}\s€$`),
  );
  await expect(stage).toBeVisible();
  await expect(cards.getByRole('button', { name: 'Acheter' })).toBeEnabled();
  await cards.getByRole('button', { name: 'Acheter' }).click();

  // Obtenue, elle quitte la liste d'achat pour le sous-onglet des
  // améliorations obtenues ; le stage, déjà listé, reste à acheter.
  await expect(cards).toBeHidden();
  await expect(stage.getByRole('button', { name: 'Acheter' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Obtenues' }).click();
  await expect(owned.getByText('Cartes de visite')).toBeVisible();
  await openTab(page, 'vie');
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 150,
  );
  await openUpgrades();
  await stage.getByRole('button', { name: 'Acheter' }).click();
  await page.getByRole('tab', { name: 'Obtenues' }).click();
  await expect(
    owned.getByText('Stage « Posture professionnelle »'),
  ).toBeVisible();

  // Le cursus apparaît dans la zone d'action de l'onglet Vie.
  await openTab(page, 'vie');

  // Étudier coûte de l'argent.
  await expect(
    page.getByRole('button', { name: 'Choisir le cursus' }),
  ).toBeVisible();
  expect(await workBox()).toEqual(workBoxAtStart);
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 20,
  );
  // La flèche ouvre le choix du cursus.
  await page.getByRole('button', { name: 'Choisir le cursus' }).click();
  await page
    .getByRole('menuitemradio', { name: /Posture professionnelle/ })
    .click();
  const studyCost = 20;
  const before = await money();
  const balanceBefore = await balanceOf(page, 'Argent');
  await page.getByRole('button', { name: 'Étudier' }).click();
  await expect(page.getByText('Vous avez étudié.')).toBeVisible();
  // L'étude se paie tout de suite et ne touche pas la balance. Si elle fait
  // passer la période, la balance annoncée s'ajoute à l'argent.
  const afterStudy = await money();
  expect([before - studyCost, before - studyCost + balanceBefore]).toContain(
    afterStudy,
  );

  // Le raccourci E étudie le cursus choisi, depuis un autre onglet.
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 20,
  );
  const beforeShortcut = await money();
  const balanceBeforeShortcut = await balanceOf(page, 'Argent');
  await page.keyboard.press('3');
  await expect(page).toHaveURL('/jeu/competences');
  await page.keyboard.press('e');
  await page.keyboard.press('2');
  await expect(page).toHaveURL('/jeu/vie');
  expect([
    beforeShortcut - studyCost,
    beforeShortcut - studyCost + balanceBeforeShortcut,
  ]).toContain(await money());

  // Cerveau plein, le personnage s'endort tout seul : les marqueurs se vident
  // un à un et se convertissent en points de stat. Travailler est impossible
  // pendant ce temps (Playwright attend que le bouton se réactive).
  const metier = page.getByRole('progressbar', { name: /^Métier/ });
  await openTab(page, 'competences');
  await expect(metier).toHaveAccessibleName(/palier 0 · 0 pts/);
  await openTab(page, 'vie');
  await repeatUntil(
    async () => {
      await work.click();
    },
    () => page.getByRole('progressbar', { name: /^Sommeil/ }).isVisible(),
    150,
  );
  await expect(page.getByText(/Cerveau 0\/\d+/)).toBeVisible();
  await openTab(page, 'competences');
  await expect(metier).not.toHaveAccessibleName(/palier 0 · 0 pts/);
  await openTab(page, 'vie');

  // La mini-jauge sous « Étudier » suit le cursus choisi : les points gagnés
  // en dormant la font avancer.
  const miniGauge = page.getByRole('progressbar', { name: /^Métier · palier/ });
  await expect(miniGauge).toBeVisible();
  expect(Number(await miniGauge.getAttribute('aria-valuenow'))).toBeGreaterThan(
    0,
  );

  // Annuler une amélioration obtenue : elle disparaît, sans remboursement.
  const beforeCancel = await money();
  await openOwned();
  await owned
    .getByRole('listitem')
    .filter({ hasText: 'Cartes de visite' })
    .getByRole('button', { name: 'Annuler' })
    .click();
  await expect(owned.getByText('Cartes de visite')).toBeHidden();
  await page.getByRole('tab', { name: 'Améliorations' }).click();
  await expect(cards.getByRole('button', { name: 'Acheter' })).toBeVisible();
  await openTab(page, 'vie');
  expect(await money()).toBe(beforeCancel);

  // Le courrier garde les messages reçus ; les comptes, la comptabilité.
  await openTab(page, 'courrier');
  await expect(page.getByText("Bienvenue dans l'euro.").first()).toBeVisible();
  await openTab(page, 'comptes');
  await expect(
    page.getByRole('table', { name: 'Comptes (version simplifiée)' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Recettes' })).toBeVisible();

  // Recommencer ramène au choix du premier emploi ; la confirmation protège
  // la vie en cours.
  const restart = page.getByRole('link', { name: 'Recommencer', exact: true });
  await restart.click();
  await expect(page).toHaveURL('/nouvelle-vie');
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Annuler' })
    .click();
  await page.getByRole('link', { name: 'Retour' }).click();
  await page.getByRole('link', { name: 'Reprendre' }).click();
  await openOwned();
  await expect(owned).toBeVisible();
  await restart.click();
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Recommencer' })
    .click();
  await expect(counter(page, 'Argent')).toHaveText(/^0\s€$/);
  await expect(page.getByText('Bienvenue dans l’euro.')).toBeVisible();
  await openOwned();
  await expect(owned).toBeHidden();

  // Rien de l'ancienne vie ne reste dans la mémoire du navigateur.
  await page.reload();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}').state,
    SAVE_KEY,
  );
  expect(saved).toMatchObject({
    period: 0,
    money: 0,
    reputation: 0,
    upgrades: [],
    companies: {},
    jobId: 'interim',
    ledger: startState.ledger,
    stats: startState.stats,
    districts: startState.districts,
  });
});
