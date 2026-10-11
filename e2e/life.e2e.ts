import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { SAVE_KEY, expectNoOverflow } from './helpers';

// Fait mourir le personnage sauvegardé au prochain chargement (après la
// sauvegarde de sortie de la page courante, qui l'écraserait sinon).
const killCharacterOnNextLoad = async (page: Page) => {
  await page.addInitScript((key) => {
    if (sessionStorage.getItem('kill') === null) {
      return;
    }
    sessionStorage.removeItem('kill');
    const save = JSON.parse(localStorage.getItem(key) ?? '{}');
    save.state.status = 'dead';
    localStorage.setItem(key, JSON.stringify(save));
  }, SAVE_KEY);
  await page.evaluate(() => {
    sessionStorage.setItem('kill', '1');
  });
};

test('une vie : titre, partie, rechargement, mort, rejouer, effacer', async ({
  page,
}) => {
  // Sans partie, le jeu renvoie au titre.
  await page.goto('/jeu');
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Ville en mouvement.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reprendre' })).toBeHidden();
  await expectNoOverflow(page);

  // Démarrer une vie ; la recharger ramène dans la partie.
  await page.getByRole('link', { name: 'Démarrer ma vie' }).click();
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await expect(page).toHaveURL('/jeu');
  await page.getByRole('button', { name: /Travailler/ }).click();
  await page.getByRole('link', { name: 'Plan de Sainte-Croissance' }).click();
  await expect(page).toHaveURL('/ville');
  await page.reload();
  await expect(page).toHaveURL('/ville');

  // Depuis le titre, on reprend la partie en cours.
  await page.goto('/');
  await page.getByRole('link', { name: 'Reprendre' }).click();
  await expect(page).toHaveURL('/jeu');

  // Après la mort, un rechargement mène à l'écran de fin et son bilan.
  await killCharacterOnNextLoad(page);
  await page.reload();
  await expect(page).toHaveURL('/fin');
  await expect(page.getByRole('heading', { name: 'You died' })).toBeVisible();
  await expect(page.getByText('Entreprises possédées')).toBeVisible();
  await expectNoOverflow(page);
  await page.goto('/jeu');
  await expect(page).toHaveURL('/fin');

  // Rejouer recommence une vie neuve.
  await page.getByRole('button', { name: 'Rejouer' }).click();
  await expect(page).toHaveURL('/nouvelle-vie');
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await expect(page).toHaveURL('/jeu');
  await page.reload();
  await expect(page).toHaveURL('/jeu');

  // Effacer la sauvegarde demande confirmation, puis renvoie au titre.
  await page.goto('/');
  await page.getByRole('button', { name: 'Effacer la sauvegarde' }).click();
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(page.getByRole('link', { name: 'Reprendre' })).toBeVisible();
  await page.getByRole('button', { name: 'Effacer la sauvegarde' }).click();
  await page.getByRole('button', { name: 'Effacer', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Reprendre' })).toBeHidden();
  await page.goto('/jeu');
  await expect(page).toHaveURL('/');
});
