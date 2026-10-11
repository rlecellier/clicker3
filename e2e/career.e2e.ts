import { expect, test } from '@playwright/test';
import { startState } from '@game/data';
import { SAVE_KEY, amountOf, counter, itemOf, repeatUntil } from './helpers';

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
  await expect(
    page.getByRole('heading', { name: 'Camille Morel' }),
  ).toBeVisible();
  await expect(page.getByText('Bienvenue dans l’euro.')).toBeVisible();
  await expect(counter(page, 'Argent')).toHaveText(/^0\s€$/);

  const work = page.getByRole('button', { name: /Travailler/ });
  const money = () => amountOf(counter(page, 'Argent'));

  // Aucun cursus au départ.
  await expect(page.getByRole('heading', { name: 'Études' })).toBeHidden();

  // Travailler paie, et l'intérim remercie.
  await work.click();
  await expect(page.getByText('Adéquat Intérim vous remercie')).toBeVisible();
  await expect(counter(page, 'Argent')).toHaveText(/^40\s€$/);

  // Les améliorations disponibles sont toutes listées, même trop chères.
  const cards = itemOf(page, 'Cartes de visite');
  const stage = itemOf(page, 'Stage « Posture professionnelle »');
  const owned = page.getByRole('region', { name: 'Obtenues', exact: true });
  await page.getByRole('tab', { name: 'Améliorations' }).click();
  await expect(cards.getByRole('button', { name: 'Acheter' })).toBeDisabled();
  await expect(stage).toBeVisible();
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 58,
  );
  await cards.getByRole('button', { name: 'Acheter' }).click();

  // Obtenue, elle quitte la liste d'achat pour celle des améliorations
  // obtenues ; le stage, déjà listé, reste à acheter.
  await expect(owned.getByText('Cartes de visite')).toBeVisible();
  await expect(stage.getByRole('button', { name: 'Acheter' })).toBeDisabled();
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 150,
  );
  await stage.getByRole('button', { name: 'Acheter' }).click();
  await expect(
    owned.getByText('Stage « Posture professionnelle »'),
  ).toBeVisible();

  // Le cursus apparaît dans la zone d'action ; étudier coûte de l'argent.
  await expect(
    page.getByRole('button', { name: 'Choisir le cursus' }),
  ).toBeVisible();
  await repeatUntil(
    () => work.click(),
    async () => (await money()) >= 20,
  );
  // La flèche ouvre le choix du cursus.
  await page.getByRole('button', { name: 'Choisir le cursus' }).click();
  await page
    .getByRole('menuitemradio', { name: /Posture professionnelle/ })
    .click();
  const before = await money();
  await page.getByRole('button', { name: 'Étudier' }).click();
  await expect(page.getByText('Vous avez étudié.')).toBeVisible();
  // L'étude coûte de l'argent (un loyer peut tomber avec elle).
  expect(await money()).toBeLessThan(before);

  // Cerveau plein, le personnage s'endort tout seul : les marqueurs se vident
  // un à un et se convertissent en points de stat. Travailler est impossible
  // pendant ce temps (Playwright attend que le bouton se réactive).
  const metier = page.getByRole('progressbar', { name: /^Métier/ });
  await expect(metier).toHaveAccessibleName(/palier 0 · 0 pts/);
  await repeatUntil(
    async () => {
      await work.click();
    },
    async () => !/ 0 pts/.test((await metier.textContent()) ?? ''),
    150,
  );
  await expect(page.getByText(/Cerveau 0\/\d+/)).toBeVisible();
  await expect(metier).not.toHaveAccessibleName(/palier 0 · 0 pts/);

  // Annuler une amélioration obtenue : elle disparaît, sans remboursement.
  const beforeCancel = await money();
  await owned
    .getByRole('listitem')
    .filter({ hasText: 'Cartes de visite' })
    .getByRole('button', { name: 'Annuler' })
    .click();
  await expect(owned.getByText('Cartes de visite')).toBeHidden();
  expect(await money()).toBe(beforeCancel);
  await expect(cards.getByRole('button', { name: 'Acheter' })).toBeVisible();

  // Le courrier garde les messages reçus ; la comptabilité, les comptes.
  await page.getByRole('tab', { name: 'Courrier' }).click();
  await expect(page.getByText("Bienvenue dans l'euro.").first()).toBeVisible();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('tab', { name: 'Comptabilité' }).click();
  await expect(
    page.getByRole('table', { name: 'Comptes (version simplifiée)' }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Recettes' })).toBeVisible();

  // Recommencer la partie ramène au choix du premier emploi ; la
  // confirmation protège la vie en cours.
  await page.getByRole('link', { name: 'Recommencer la partie' }).click();
  await expect(page).toHaveURL('/nouvelle-vie');
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Annuler' })
    .click();
  await page.getByRole('link', { name: 'Retour' }).click();
  await page.getByRole('link', { name: 'Reprendre' }).click();
  await expect(owned).toBeVisible();
  await page.getByRole('link', { name: 'Recommencer la partie' }).click();
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Recommencer' })
    .click();
  await expect(counter(page, 'Argent')).toHaveText(/^0\s€$/);
  await expect(owned).toBeHidden();
  await expect(page.getByText('Bienvenue dans l’euro.')).toBeVisible();

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
