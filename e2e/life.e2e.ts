import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { actionRules } from '@game/data';
import { SAVE_KEY, closeBirthday, expectNoOverflow, openTab } from './helpers';

// Change la partie sauvegardée au prochain chargement (après la sauvegarde de
// sortie de la page courante, qui l'écraserait sinon).
const patchSaveOnNextLoad = async (
  page: Page,
  patch: Record<string, unknown>,
) => {
  await page.addInitScript((key) => {
    const raw = sessionStorage.getItem('patch');
    if (raw === null) {
      return;
    }
    sessionStorage.removeItem('patch');
    const save = JSON.parse(localStorage.getItem(key) ?? '{}');
    Object.assign(save.state, JSON.parse(raw));
    localStorage.setItem(key, JSON.stringify(save));
  }, SAVE_KEY);
  await page.evaluate((text) => {
    sessionStorage.setItem('patch', text);
  }, JSON.stringify(patch));
};

// Fait mourir le personnage sauvegardé au prochain chargement.
const killCharacterOnNextLoad = (page: Page) =>
  patchSaveOnNextLoad(page, { status: 'dead' });

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
  // Le départ fête les 18 ans, et le jeu attend que la fenêtre soit fermée.
  await closeBirthday(page, 'Joyeux 18e anniversaire !');
  await page.getByRole('button', { name: /Travailler/ }).click();

  // L'en-tête dit ce que fait le personnage ; les étoiles de réputation sont
  // dans la barre de titre de la fenêtre Vie, plus dans l'en-tête.
  await expect(page.getByRole('banner').getByText('Au travail')).toBeVisible();
  await expect(
    page
      .getByRole('region', { name: 'Ma vie à Sainte-Croissance' })
      .getByRole('img', { name: /^Réputation/ }),
  ).toBeVisible();

  // À 480 px, la barre des tâches est en bas : Démarrer et les onglets
  // épinglés en icônes seules, qui gardent leur nom accessible.
  const taskbar = page.getByRole('navigation', { name: 'Navigation du jeu' });
  await expect(taskbar.getByText('Vie', { exact: true })).toBeHidden();
  await expect(taskbar.getByRole('link', { name: 'Vie' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expectNoOverflow(page);

  // Le menu Démarrer liste tous les onglets avec leur libellé, laisse voir le
  // jeu au-dessus, et se ferme d'un tap à côté ou sur Échap.
  const start = taskbar.getByRole('button', { name: /^Démarrer/ });
  await start.tap();
  const menu = page.getByRole('navigation', { name: 'Menu Démarrer' });
  await expect(menu.getByRole('link', { name: 'Ville' })).toBeVisible();
  await expect(menu.getByText('Recommencer')).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await page.getByRole('button', { name: 'Fermer le menu' }).tap({
    position: { x: 350, y: 100 },
  });
  await expect(menu).toBeHidden();
  await start.tap();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();

  // Zones tactiles : chaque bouton et lien de la barre fait au moins 44×44 px.
  const targets = [
    ...(await taskbar.getByRole('link').all()),
    ...(await taskbar.getByRole('button').all()),
  ];
  for (const target of targets) {
    const box = await target.boundingBox();
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
  // Le sommeil s'affiche sans réglage : 8 h de base, donc 16 h d'éveil. Le
  // bouton annonce combien d'actions tiennent avant la nuit, sans horloge.
  const sleepInfo = page.getByRole('region', { name: 'Sommeil' });
  await expect(sleepInfo).toContainText(
    'Sommeil : 8 h par jour (éveil : 16 h)',
  );
  await expect(page.getByLabel('Durée du sommeil')).toBeHidden();
  const work = page.getByRole('button', { name: /Travailler/ });
  const timesLeft = async () =>
    Number(
      /encore (\d+) fois/.exec(
        (await page
          .getByText(/encore \d+ fois/)
          .first()
          .textContent()) ?? '',
      )?.[1],
    );
  const withEightHours = await timesLeft();
  // Un tap vaut une action de moins avant la nuit.
  await work.tap();
  expect(await timesLeft()).toBe(withEightHours - 1);
  // Une heure de sommeil en moins (amélioration) : une action de plus.
  await patchSaveOnNextLoad(page, {
    upgrades: ['application-sommeil'],
    sleepLessHours: 1,
    gaugeCapacity: 1020,
    gauge: 0,
    gaugeSegments: [],
  });
  await page.reload();
  await expect(sleepInfo).toContainText(
    'Sommeil : 7 h par jour (éveil : 17 h)',
  );
  expect(await timesLeft()).toBe(Math.ceil(1020 / actionRules.work.minutes));
  expect(withEightHours).toBeLessThanOrEqual(
    Math.ceil(960 / actionRules.work.minutes),
  );
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
  await expect(page.getByText('Argent gagné sur toute la vie')).toBeVisible();
  await expect(page.getByText('Entreprises possédées')).toBeVisible();
  await expect(page.getByText('Améliorations achetées')).toBeVisible();
  await expect(page.getByText('Logement')).toBeVisible();
  await expectNoOverflow(page);
  await page.goto('/jeu');
  await expect(page).toHaveURL('/fin');

  // Rejouer recommence une vie neuve.
  await page.getByRole('button', { name: 'Rejouer' }).click();
  await expect(page).toHaveURL('/nouvelle-vie');
  await page.getByRole('button', { name: 'Prendre ce poste' }).click();
  await expect(page).toHaveURL('/jeu/vie');
  await closeBirthday(page, 'Joyeux 18e anniversaire !');
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
