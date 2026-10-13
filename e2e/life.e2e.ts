import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { SAVE_KEY, expectNoOverflow, openTab } from './helpers';

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
  await expect(page).toHaveURL('/jeu/vie');
  await page.getByRole('button', { name: /Travailler/ }).click();

  // L'en-tête dit ce que fait le personnage ; les étoiles de réputation sont
  // dans la barre de titre de la fenêtre Vie, plus dans l'en-tête.
  await expect(page.getByRole('banner').getByText('Au travail')).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Ma vie à Sainte-Croissance' })
      .getByRole('img', { name: /^Réputation/ }),
  ).toBeVisible();

  // À 480 px, la sidebar est à gauche et en icônes seules, mais chaque onglet
  // garde son nom accessible.
  const sidebar = page.getByRole('navigation', { name: 'Navigation du jeu' });
  await expect(sidebar.getByText('Vie', { exact: true })).toBeHidden();
  await expect(sidebar.getByRole('link', { name: 'Vie' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expectNoOverflow(page);

  // Zones tactiles : chaque lien de la sidebar fait au moins 44×44 px.
  const links = await sidebar.getByRole('link').all();
  for (const link of links) {
    const box = await link.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  // Chaque onglet a son URL ; recharger ou revenir en arrière le conserve.
  await openTab(page, 'ville');
  await openTab(page, 'entreprises');
  await page.reload();
  await expect(page).toHaveURL('/jeu/entreprises');
  await expect(page.getByRole('tab', { name: 'À acheter' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL('/jeu/ville');
  await expect(
    page.getByRole('group', { name: 'Plan de la ville' }),
  ).toBeVisible();
  await openTab(page, 'ameliorations');
  await openTab(page, 'profil');
  await openTab(page, 'vie');
  // La durée du sommeil se règle au toucher, sous Étudier ; l'horaire annoncé suit.
  await expect(
    page.getByRole('status').filter({ hasText: 'Long : coucher 23 h' }),
  ).toBeVisible();
  await page.getByLabel('Court').tap();
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Court : coucher 2 h · réveil 6 h' }),
  ).toBeVisible();
  await openTab(page, 'emploi');
  await openTab(page, 'comptes');
  await openTab(page, 'finance');
  await openTab(page, 'courrier');

  // Les anciens liens et les onglets inconnus mènent à l'onglet par défaut.
  await page.goto('/ville');
  await expect(page).toHaveURL('/jeu/ville');
  await page.goto('/jeu');
  await expect(page).toHaveURL('/jeu/vie');
  await page.goto('/jeu/inconnu');
  await expect(page).toHaveURL('/jeu/vie');

  // Depuis le titre, on reprend la partie en cours.
  await page.goto('/');
  await page.getByRole('link', { name: 'Reprendre' }).click();
  await expect(page).toHaveURL('/jeu/vie');

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
  await expect(page).toHaveURL('/jeu/vie');
  await page.reload();
  await expect(page).toHaveURL('/jeu/vie');

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
